// @flow

import chalk from 'chalk';
import fsp from 'fs-promise';
import path from 'path';
import pathExists from 'path-exists';
import spawn from 'cross-spawn';

// UPDATE DEPENDENCY VERSIONS HERE
const DEFAULT_DEPENDENCIES = {
  expo: '^15.0.0',
  react: '~15.4.0',
  'react-native': '0.42.3',
};

// TODO figure out how this interacts with ejection
const DEFAULT_DEV_DEPENDENCIES = {
  'jest-expo': '^0.3.0',
  'react-test-renderer': '~15.4.1',
};

module.exports = async (appPath: string, appName: string, verbose: boolean, cwd: string = '') => {
  const ownPackageName: string = require('../../package.json').name;
  const ownPath: string = path.join(appPath, 'node_modules', ownPackageName);
  const useYarn: boolean = await pathExists(path.join(appPath, 'yarn.lock'));

  const readmeExists: boolean = await pathExists(path.join(appPath, 'README.md'));
  if (readmeExists) {
    await fsp.rename(path.join(appPath, 'README.md'), path.join(appPath, 'README.old.md'));
  }

  const appPackagePath: string = path.join(appPath, 'package.json');
  const appPackage = JSON.parse(await fsp.readFile(appPackagePath));

  // mutate the default package.json in any ways we need to
  appPackage.main = './node_modules/react-native-scripts/build/bin/crna-entry.js';
  appPackage.scripts = {
    start: 'react-native-scripts start',
    eject: 'react-native-scripts eject',
    android: 'react-native-scripts android',
    ios: 'react-native-scripts ios',
    test: 'node node_modules/jest/bin/jest.js --watch',
  };

  appPackage.jest = {
    preset: 'jest-expo',
  };

  if (!appPackage.dependencies) {
    appPackage.dependencies = {};
  }

  if (!appPackage.devDependencies) {
    appPackage.devDependencies = {};
  }

  // react-native-scripts is already in the package.json devDependencies
  // so we need to merge instead of assigning
  Object.assign(appPackage.dependencies, DEFAULT_DEPENDENCIES);
  Object.assign(appPackage.devDependencies, DEFAULT_DEV_DEPENDENCIES);

  // Write the new appPackage after copying so that we can include any existing
  await fsp.writeFile(appPackagePath, JSON.stringify(appPackage, null, 2));

  // Copy the files for the user
  await fsp.copy(path.join(ownPath, 'template'), appPath);

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  try {
    await fsp.rename(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'));
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = await fsp.readFile(path.join(appPath, 'gitignore'));
      await fsp.appendFile(path.join(appPath, '.gitignore'), data);
      await fsp.unlink(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  // Run yarn or npm
  let command = '';
  let args = [];

  if (useYarn) {
    command = 'yarnpkg';
  } else {
    command = 'npm';
    args = ['install', '--save'];

    if (verbose) {
      args.push('--verbose');
    }
  }

  console.log(`Installing dependencies using ${command}...`);
  console.log();

  if (command === 'yarnpkg') {
    // it's weird to print a yarn alias that no one uses
    command = 'yarn';
  }

  const proc = spawn(command, args, { stdio: 'inherit' });
  proc.on('close', code => {
    if (code !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }

    // display the cleanest way to get to the app dir
    // if the cwd + appName is equal to the full path, then just cd into appName
    let cdpath;
    if (path.resolve(cwd, appName) === appPath) {
      cdpath = appName;
    } else {
      cdpath = appPath;
    }

    console.log(
      `

Success! Created ${appName} at ${appPath}
Inside that directory, you can run several commands:

  ${chalk.cyan(command + ' start')}
    Starts the development server so you can open your app in the Expo
    app on your phone.

  ${chalk.cyan(command + ' run ios')}
    (Mac only, requires Xcode)
    Starts the development server and loads your app in an iOS simulator.

  ${chalk.cyan(command + ' run android')}
    (Requires Android build tools)
    Starts the development server and loads your app on a connected Android
    device or emulator.

  ${chalk.cyan(command + ' test')}
    Starts the test runner.

  ${chalk.cyan(command + ' run eject')}
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  ${chalk.cyan('cd ' + cdpath)}
  ${chalk.cyan(command + ' start')}`
    );

    if (readmeExists) {
      console.log(
        `
${chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`')}`
      );
    }

    console.log();
    console.log('Happy hacking!');
  });
};
