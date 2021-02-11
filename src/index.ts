#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { ensureDir, existsSync } from 'fs-extra';
import * as path from 'path';
import prompts from 'prompts';

import * as Examples from './Examples';
import log from './Logger';
import * as Template from './Template';
import shouldUpdate, { shouldUseYarn } from './Update';

const packageJSON = require('../package.json');

let inputPath: string;

const program = new Command(packageJSON.name)
  .version(packageJSON.version)
  .arguments('<project-root>')
  .usage(`${chalk.magenta('<project-root>')} [options]`)
  .description('Creates a new React Native project')
  .option('--use-npm', 'Use npm to install dependencies. (default when Yarn is not installed)')
  .option('-y, --yes', 'Use the default options for creating a project')
  .option('--no-install', 'Skip installing npm packages or CocoaPods.')
  .option(
    '-t, --template [template|url]',
    'The name of a template from expo/examples or URL to a GitHub repo that contains an example.'
  )
  .option('--template-path [name]', 'The path inside of a GitHub repo where the example lives.')
  .allowUnknownOption()
  .action(projectRoot => (inputPath = projectRoot))
  .parse(process.argv);

async function runAsync(): Promise<void> {
  try {
    let projectRoot: string;
    if (!inputPath && program.yes) {
      projectRoot = path.resolve(process.cwd());
      const folderName = path.basename(projectRoot);
      assertValidName(folderName);
      assertFolderEmpty(projectRoot, folderName);
    } else {
      projectRoot = await resolveProjectRootAsync(inputPath);
    }

    let resolvedTemplate: string | null = program.template;
    // @ts-ignore: This guards against someone passing --template without a name after it.
    if (resolvedTemplate === true) {
      console.log();
      console.log('Please specify the template');
      console.log();
      process.exit(1);
    }
    if (!resolvedTemplate && !program.yes) {
      resolvedTemplate = await Examples.promptAsync();
    }
    let templatePath = program.templatePath;

    await ensureDir(projectRoot);
    let extractTemplateStep = Template.logNewSection(`Locating project files.`);

    try {
      if (resolvedTemplate) {
        await Examples.resolveTemplateArgAsync(
          projectRoot,
          extractTemplateStep,
          resolvedTemplate,
          templatePath
        );

        await Examples.appendScriptsAsync(projectRoot);
      } else {
        await Template.extractAndPrepareTemplateAppAsync(projectRoot);
      }
      extractTemplateStep.succeed('Downloaded and extracted project files.');
    } catch (e) {
      extractTemplateStep.fail(
        'Something went wrong in downloading and extracting the project files.'
      );

      process.exit(1);
    }

    // Install dependencies

    const shouldInstall = program.install;
    const packageManager = resolvePackageManager();

    let podsInstalled: boolean = false;
    const needsPodsInstalled = await existsSync(path.join(projectRoot, 'ios'));
    if (shouldInstall) {
      await installNodeDependenciesAsync(projectRoot, packageManager);
      if (needsPodsInstalled) {
        podsInstalled = await installCocoaPodsAsync(projectRoot);
      }
    }

    const cdPath = getChangeDirectoryPath(projectRoot);
    log.newLine();
    Template.logProjectReady({ cdPath, packageManager });

    if (!shouldInstall) {
      logNodeInstallWarning(cdPath, packageManager);
    }
    if (needsPodsInstalled && !podsInstalled) {
      logCocoaPodsWarning(cdPath);
    }

    // for now, we will just init a git repo if they have git installed and the
    // project is not inside an existing git tree, and do it silently. we should
    // at some point check if git is installed and actually bail out if not, because
    // npm install will fail with a confusing error if so.
    try {
      // check if git is installed
      // check if inside git repo
      await Template.initGitRepoAsync(projectRoot, { silent: true });
    } catch {
      // todo: check if git is installed, bail out
    }
  } catch (error) {
    await commandDidThrowAsync(error);
  }
  await shouldUpdate();
  process.exit(0);
}

function getChangeDirectoryPath(projectRoot: string): string {
  const cdPath = path.relative(process.cwd(), projectRoot);
  if (cdPath.length <= projectRoot.length) {
    return cdPath;
  }
  return projectRoot;
}

async function installNodeDependenciesAsync(
  projectRoot: string,
  packageManager: Template.PackageManagerName
): Promise<void> {
  const installJsDepsStep = Template.logNewSection('Installing JavaScript dependencies.');
  try {
    await Template.installDependenciesAsync(projectRoot, packageManager, { silent: true });
    installJsDepsStep.succeed('Installed JavaScript dependencies.');
  } catch {
    installJsDepsStep.fail(
      `Something when wrong installing JavaScript dependencies. Check your ${packageManager} logs. Continuing to initialize the app.`
    );
  }
}

async function installCocoaPodsAsync(projectRoot: string): Promise<boolean> {
  let podsInstalled = false;
  try {
    podsInstalled = await Template.installPodsAsync(projectRoot);
  } catch {}

  return podsInstalled;
}

function logNodeInstallWarning(cdPath: string, packageManager: Template.PackageManagerName): void {
  log.newLine();
  log.nested(`⚠️  Before running your app, make sure you have node modules installed:`);
  log.nested('');
  log.nested(`  cd ${cdPath ?? '.'}/`);
  log.nested(`  ${packageManager === 'npm' ? 'npm install' : 'yarn'}`);
  log.nested('');
}

function logCocoaPodsWarning(cdPath: string): void {
  if (process.platform !== 'darwin') {
    return;
  }
  log.newLine();
  log.nested(
    `⚠️  Before running your app on iOS, make sure you have CocoaPods installed and initialize the project:`
  );
  log.nested('');
  log.nested(`  cd ${cdPath ?? '.'}/ios`);
  log.nested(`  npx pod-install`);
  log.nested('');
}

runAsync();

function resolvePackageManager(): Template.PackageManagerName {
  let packageManager: Template.PackageManagerName = 'npm';

  if (!program.useNpm && shouldUseYarn()) {
    packageManager = 'yarn';
    log.newLine();
    log('Using Yarn to install packages. You can pass --use-npm to use npm instead.');
    log.newLine();
  } else {
    log.newLine();
    log('Using npm to install packages.');
    log.newLine();
  }
  return packageManager;
}

function assertFolderEmpty(projectRoot: string, folderName: string) {
  const conflicts = Template.getConflictsForDirectory(projectRoot);
  if (conflicts.length) {
    log.nested(`The directory ${chalk.green(folderName)} has files that might be overwritten:`);
    log.newLine();
    for (const file of conflicts) {
      log.nested(`  ${file}`);
    }
    log.newLine();
    log.nested('Try using a new directory name, or moving these files.');
    log.newLine();
    process.exit(1);
  }
}

function assertValidName(folderName: string) {
  const validation = Template.validateName(folderName);
  if (typeof validation === 'string') {
    log.error(`Cannot create an app named ${chalk.red(`"${folderName}"`)}. ${validation}`);
    process.exit(1);
  }
}

async function resolveProjectRootAsync(input: string): Promise<string> {
  let name = input?.trim();

  if (!name) {
    const { answer } = await prompts({
      type: 'text',
      name: 'answer',
      message: 'What is your app named?',
      initial: 'my-react-app',
      validate: name => {
        const validation = Template.validateName(path.basename(path.resolve(name)));
        if (typeof validation === 'string') {
          return 'Invalid project name: ' + validation;
        }
        return true;
      },
    });

    if (typeof answer === 'string') {
      name = answer.trim();
    }
  }

  if (!name) {
    log.newLine();
    log.nested('Please choose your app name:');
    log.nested(`  ${chalk.green(program.name())} ${chalk.magenta('<app-name>')}`);
    log.newLine();
    log.nested(`Run ${chalk.green(`${program.name()} --help`)} for more info.`);
    process.exit(1);
  }

  const projectRoot = path.resolve(name);
  const folderName = path.basename(projectRoot);

  assertValidName(folderName);

  await ensureDir(projectRoot);

  assertFolderEmpty(projectRoot, folderName);

  return projectRoot;
}

async function commandDidThrowAsync(error: any) {
  log.newLine();
  log.nested(chalk.red(`An unexpected error occurred:`));
  log.nested(error);
  log.newLine();

  await shouldUpdate();

  process.exit(1);
}
