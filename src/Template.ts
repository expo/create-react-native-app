import JsonFile from '@expo/json-file';
import * as PackageManager from '@expo/package-manager';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { ensureDir, readdirSync } from 'fs-extra';
import getenv from 'getenv';
// @ts-ignore
import merge from 'lodash/merge';
import Minipass from 'minipass';
import npmPackageArg from 'npm-package-arg';
import ora from 'ora';
import pacote, { PackageSpec } from 'pacote';
import * as path from 'path';
import { Readable } from 'stream';
import tar, { ReadEntry } from 'tar';
import terminalLink from 'terminal-link';

import Logger from './Logger';
import * as Paths from './Paths';

const isMacOS = process.platform === 'darwin';

type AppJSONConfig = Record<string, any>;

function sanitizedName(name: string) {
  return name
    .replace(/[\W_]+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

class Transformer extends Minipass {
  data: string;
  config: AppJSONConfig;

  constructor(config: AppJSONConfig) {
    super();
    this.data = '';
    this.config = config;
  }
  write(data: string) {
    this.data += data;
    return true;
  }
  end() {
    let replaced = this.data
      .replace(/Hello App Display Name/g, this.config.name)
      .replace(/HelloWorld/g, sanitizedName(this.config.name))
      .replace(/helloworld/g, sanitizedName(this.config.name.toLowerCase()));
    super.write(replaced);
    return super.end();
  }
}

// Binary files, don't process these (avoid decoding as utf8)
const binaryExtensions = ['.png', '.jar', '.keystore'];

function createFileTransform(config: AppJSONConfig) {
  return function transformFile(entry: ReadEntry) {
    if (!binaryExtensions.includes(path.extname(entry.path)) && config.name) {
      return new Transformer(config);
    }
    return undefined;
  };
}

// Currently only support bare JS project
// TODO(Bacon): Add examples
const templateSpec = npmPackageArg('expo-template-bare-typescript');

/**
 * Extract a template app to a given file path and clean up any properties left over from npm to
 * prepare it for usage.
 */
export async function extractAndPrepareTemplateAppAsync(projectRoot: string) {
  const projectName = path.basename(projectRoot);

  const config = {
    name: projectName,
    expo: {
      name: projectName,
      slug: projectName,
    },
  };
  await extractTemplateAppAsync(templateSpec, projectRoot, config);

  let appFile = new JsonFile(path.join(projectRoot, 'app.json'));
  let appJson = merge(await appFile.readAsync(), config);
  await appFile.writeAsync(appJson);

  let packageFile = new JsonFile(path.join(projectRoot, 'package.json'));
  let packageJson = await packageFile.readAsync();
  // Adding `private` stops npm from complaining about missing `name` and `version` fields.
  // We don't add a `name` field because it also exists in `app.json`.
  packageJson = { ...packageJson, private: true };
  // These are metadata fields related to the template package, let's remove them from the package.json.
  delete packageJson.name;
  delete packageJson.version;
  delete packageJson.description;
  delete packageJson.tags;
  delete packageJson.repository;
  // pacote adds these, but we don't want them in the package.json of the project.
  delete packageJson._resolved;
  delete packageJson._integrity;
  delete packageJson._from;
  await packageFile.writeAsync(packageJson);

  return projectRoot;
}

/**
 * Extract a template app to a given file path.
 */
async function extractTemplateAppAsync(
  templateSpec: PackageSpec,
  targetPath: string,
  config: AppJSONConfig
) {
  await pacote.tarball.stream(
    templateSpec,
    tarStream => {
      return extractTemplateAppAsyncImpl(targetPath, config, tarStream);
    },
    {
      cache: path.join(Paths.dotExpoHomeDirectory(), 'template-cache'),
    }
  );

  return targetPath;
}

async function extractTemplateAppAsyncImpl(
  targetPath: string,
  config: AppJSONConfig,
  tarStream: Readable
) {
  await ensureDir(targetPath);
  await new Promise((resolve, reject) => {
    const extractStream = tar.x({
      cwd: targetPath,
      strip: 1,
      // TODO(ville): pending https://github.com/DefinitelyTyped/DefinitelyTyped/pull/36598
      // @ts-ignore property missing from the type definition
      transform: createFileTransform(config),
      onentry(entry: ReadEntry) {
        if (config.name) {
          // Rewrite paths for bare workflow
          entry.path = entry.path
            .replace(
              /HelloWorld/g,
              entry.path.includes('android')
                ? sanitizedName(config.name.toLowerCase())
                : sanitizedName(config.name)
            )
            .replace(/helloworld/g, sanitizedName(config.name).toLowerCase());
        }
        if (entry.type && /^file$/i.test(entry.type) && path.basename(entry.path) === 'gitignore') {
          // Rename `gitignore` because npm ignores files named `.gitignore` when publishing.
          // See: https://github.com/npm/npm/issues/1862
          entry.path = entry.path.replace(/gitignore$/, '.gitignore');
        }
      },
    });
    tarStream.on('error', reject);
    extractStream.on('error', reject);
    extractStream.on('close', resolve);
    tarStream.pipe(extractStream);
  });
}

export function validateName(name?: string): string | true {
  if (typeof name !== 'string' || name === '') {
    return 'The project name can not be empty.';
  }
  if (!/^[a-z0-9@.\-_]+$/i.test(name)) {
    return 'The project name can only contain URL-friendly characters.';
  }
  return true;
}

export async function initGitRepoAsync(
  root: string,
  flags: { silent: boolean } = { silent: false }
) {
  // let's see if we're in a git tree
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd: root });
    !flags.silent && Logger.gray('New project is already inside of a git repo, skipping git init.');
  } catch (e) {
    if (e.errno === 'ENOENT') {
      !flags.silent && Logger.gray('Unable to initialize git repo. `git` not in PATH.');
      return false;
    }
  }

  // not in git tree, so let's init
  try {
    execSync('git init', { stdio: 'ignore', cwd: root });
    execSync('git add -A', { stdio: 'ignore', cwd: root });
    execSync('git commit -m "Initial commit via create-react-native-app"', {
      stdio: 'ignore',
      cwd: root,
    });

    !flags.silent && Logger.gray('Initialized a git repository.');
    return true;
  } catch (e) {
    // no-op -- this is just a convenience and we don't care if it fails
    return false;
  }
}

export async function installDependenciesAsync(
  projectRoot: string,
  packageManager: 'yarn' | 'npm',
  flags: { silent: boolean } = { silent: false }
) {
  const options = { cwd: projectRoot, silent: flags.silent };
  if (packageManager === 'yarn') {
    const yarn = new PackageManager.YarnPackageManager(options);
    await yarn.installAsync();
  } else {
    await new PackageManager.NpmPackageManager(options).installAsync();
  }
}

// Any of these files are allowed to exist in the projectRoot
const tolerableFiles = [
  // System
  '.DS_Store',
  'Thumbs.db',
  // Git
  '.git',
  '.gitattributes',
  '.gitignore',
  // Project
  '.npmignore',
  '.travis.yml',
  'LICENSE',
  'docs',
  '.idea',
  // Package manager
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
];

export function getConflictsForDirectory(projectRoot: string): string[] {
  return readdirSync(projectRoot).filter(
    (file: string) => !(/\.iml$/.test(file) || tolerableFiles.includes(file))
  );
}

export function logProjectReady({
  cdPath,
  packageManager,
}: {
  cdPath: string;
  packageManager: string;
}) {
  Logger.nested(chalk.bold(`✅ Your project is ready!`));
  Logger.newLine();

  // empty string if project was created in current directory
  if (cdPath) {
    Logger.nested(
      `To run your project, navigate to the directory and run one of the following ${packageManager} commands.`
    );
    Logger.newLine();
    Logger.nested(`- ${chalk.bold('cd ' + cdPath)}`);
  } else {
    Logger.nested(`To run your project, run one of the following ${packageManager} commands.`);
    Logger.newLine();
  }

  Logger.nested(`- ${chalk.bold(packageManager === 'npm' ? 'npm run android' : 'yarn android')}`);

  let macOSComment = '';
  if (!isMacOS) {
    macOSComment =
      ' # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac';
  }
  Logger.nested(
    `- ${chalk.bold(packageManager === 'npm' ? 'npm run ios' : 'yarn ios')}${macOSComment}`
  );

  Logger.nested(`- ${chalk.bold(packageManager === 'npm' ? 'npm run web' : 'yarn web')}`);

  Logger.newLine();
  Logger.nested(
    `💡 You can also open up the projects in the ${chalk.bold('ios')} and ${chalk.bold(
      'android'
    )} directories with their respective IDEs.`
  );
  Logger.nested(
    `🚀 Please note that ${terminalLink(
      'expo-updates',
      'https://github.com/expo/expo/blob/master/packages/expo-updates/README.md'
    )} has been configured in your project. Before you do a release build, make sure you run ${chalk.bold(
      'expo publish'
    )}. ${terminalLink('Learn more.', 'https://expo.fyi/release-builds-with-expo-updates')}`
  );
}

export async function installPodsAsync(projectRoot: string) {
  let step = logNewSection('Installing CocoaPods.');
  if (process.platform !== 'darwin') {
    step.succeed('Skipped installing CocoaPods because operating system is not on macOS.');
    return false;
  }
  const packageManager = new PackageManager.CocoaPodsPackageManager({
    cwd: path.join(projectRoot, 'ios'),
    log: Logger.nested,
    silent: getenv.boolish('EXPO_DEBUG', true),
  });

  if (!(await packageManager.isCLIInstalledAsync())) {
    try {
      step.text = 'CocoaPods CLI not found in your PATH, installing it now.';
      step.render();
      await packageManager.installCLIAsync();
      step.succeed('Installed CocoaPods CLI');
      step = logNewSection('Running `pod install` in the `ios` directory.');
    } catch (e) {
      step.stopAndPersist({
        symbol: '⚠️ ',
        text: chalk.red(
          'Unable to install the CocoaPods CLI. Continuing with initializing the project, you can install CocoaPods afterwards.'
        ),
      });
      if (e.message) {
        Logger.nested(`- ${e.message}`);
      }
      return false;
    }
  }

  try {
    await packageManager.installAsync();
    step.succeed('Installed pods and initialized Xcode workspace.');
    return true;
  } catch (e) {
    step.stopAndPersist({
      symbol: '⚠️ ',
      text: chalk.red(
        'Something when wrong running `pod install` in the `ios` directory. Continuing with initializing the project, you can debug this afterwards.'
      ),
    });
    if (e.message) {
      Logger.nested(`- ${e.message}`);
    }
    return false;
  }
}

export function logNewSection(title: string) {
  let spinner = ora(chalk.bold(title));
  spinner.start();
  return spinner;
}
