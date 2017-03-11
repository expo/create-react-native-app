#!/usr/bin/env node

// @flow

// DON'T MODIFY THIS FILE
// IF AT ALL POSSIBLE, MAKE ANY CHANGES IN THE SCRIPTS PACKAGE

import fsp from 'fs-promise';
import chalk from 'chalk';
import minimist from 'minimist';
import path from 'path';
import pathExists from 'path-exists';
import semver from 'semver';
import spawn from 'cross-spawn';

const argv = minimist(process.argv.slice(2));

/**
 * Arguments:
 *   --version - to print current version
 *   --verbose - to print npm logs during init
 *   --scripts-version <alternative package>
 *     Example of valid values:
 *     - a specific npm version: "0.22.0-rc1"
 *     - a .tgz archive from npm: "https://registry.npmjs.org/react-native-scripts/-/react-native-scripts-0.20.0.tgz"
 *     - a package from `tasks/clean_pack.sh`: "/home/adam/create-react-native-app/react-native-scripts-0.22.0.tgz"
 */
const commands = argv._;
const cwd = process.cwd();

if (commands.length === 0) {
  if (argv.version) {
    const version = require('../package.json').version;
    console.log(`create-react-native-app version: ${version}`);
    process.exit();
  }
  console.error('Usage: create-react-native-app <project-directory> [--verbose]');
  process.exit(1);
}

createApp(commands[0], !!argv.verbose, argv['scripts-version']).then(() => {});

async function createApp(name: string, verbose: boolean, version: ?string): Promise<void> {
  const root = path.resolve(name);
  const appName = path.basename(root);

  const packageToInstall = getInstallPackage(version);
  const packageName = getPackageName(packageToInstall);
  checkAppName(appName, packageName);

  if (!await pathExists(name)) {
    await fsp.mkdir(root);
  } else if (!await isSafeToCreateProjectIn(root)) {
    console.log(`The directory \`${name}\` contains file(s) that could conflict. Aborting.`);
    process.exit(1);
  }

  console.log(`Creating a new React Native app in ${root}.`);
  console.log();

  const packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };
  await fsp.writeFile(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
  process.chdir(root);

  console.log('Installing packages. This might take a couple minutes.');
  console.log('Installing react-native-scripts...');
  console.log();

  await run(root, appName, version, verbose, packageToInstall, packageName);
}

function install(
  packageToInstall: string,
  verbose: boolean,
  callback: (code: number, command: string, args: Array<string>) => Promise<void>
): void {
  let args = ['add', '--dev', '--exact', packageToInstall];
  const proc = spawn('yarnpkg', args, { stdio: 'inherit' });

  let yarnExists = true;
  proc.on('error', function(err) {
    if (err.code === 'ENOENT') {
      yarnExists = false;
    }
  });

  proc.on('close', function(code) {
    if (yarnExists) {
      callback(code, 'yarnpkg', args).then(
        () => {},
        e => {
          throw e;
        }
      );
      return;
    }
    // No Yarn installed, continuing with npm.
    args = ['install'];

    if (verbose) {
      args.push('--verbose');
    }

    args = args.concat(['--save-dev', '--save-exact', packageToInstall]);

    const npmProc = spawn('npm', args, { stdio: 'inherit' });
    npmProc.on('close', function(code) {
      callback(code, 'npm', args).then(
        () => {},
        e => {
          throw e;
        }
      );
    });
  });
}

async function run(
  root: string,
  appName: string,
  version: ?string,
  verbose: boolean,
  packageToInstall: string,
  packageName: string
): Promise<void> {
  install(packageToInstall, verbose, async (code: number, command: string, args: Array<string>) => {
    if (code !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }

    await checkNodeVersion(packageName);

    const scriptsPath = path.resolve(
      process.cwd(),
      'node_modules',
      packageName,
      'build',
      'scripts',
      'init.js'
    );

    // $FlowFixMe (dikaiosune) maybe there's a way to convince flow this is legit?
    const init = require(scriptsPath);
    await init(root, appName, cwd, verbose);
  });
}

function getInstallPackage(version: ?string): string {
  let packageToInstall = 'react-native-scripts';
  const validSemver = semver.valid(version);
  if (validSemver) {
    packageToInstall += '@' + validSemver;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall;
}

// Extract package name from tarball url or path.
function getPackageName(installPackage: string): string {
  if (installPackage.indexOf('.tgz') > -1) {
    // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
    // However, this function returns package name only wihout semver version.
    const matches = installPackage.match(/^.+[\/\\](.+?)(?:-\d+.+)?\.tgz$/);
    if (matches && matches.length >= 2) {
      return matches[1];
    } else {
      throw new Error(
        `Provided scripts package (${installPackage}) doesn't have a valid filename.`
      );
    }
  } else if (installPackage.indexOf('@') > 0) {
    // Do not match @scope/ when stripping off @version or @tag
    return installPackage.charAt(0) + installPackage.substr(1).split('@')[0];
  }
  return installPackage;
}

async function checkNodeVersion(packageName: string): Promise<void> {
  const packageJsonPath = path.resolve(process.cwd(), 'node_modules', packageName, 'package.json');

  const packageJson = JSON.parse(await fsp.readFile(packageJsonPath));
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are currently running Node %s but create-react-native-app requires %s.' +
          ' Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
}

function checkAppName(appName: string, packageName: string): void {
  const allDependencies = [
    'react-native-scripts',
    'exponent',
    'expo',
    'vector-icons',
    'react',
    'react-native',
  ];

  if (allDependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        'We cannot create a project called `' +
          appName +
          '` because a dependency with the same name exists.\n' +
          'Due to the way npm works, the following names are not allowed:\n\n'
      ) +
        chalk.cyan(
          allDependencies
            .map(depName => {
              return '  ' + depName;
            })
            .join('\n')
        ) +
        chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

// If project only contains files generated by GH, it’s safe
async function isSafeToCreateProjectIn(root: string): Promise<boolean> {
  const validFiles = ['.DS_Store', 'Thumbs.db', '.git', '.gitignore', 'README.md', 'LICENSE'];
  return (await fsp.readdir(root)).every(file => {
    return validFiles.indexOf(file) >= 0;
  });
}
