// @flow

import chalk from 'chalk';
import fse from 'fs-extra';
import path from 'path';
import pathExists from 'path-exists';
import spawn from 'cross-spawn';
import minimist from 'minimist';
import log from '../util/log';
import install from '../util/install';
import { hasYarn } from '../util/pm';

// UPDATE DEPENDENCY VERSIONS HERE
const DEFAULT_DEPENDENCIES = {
  expo: '^25.0.0',
  react: '16.2.0',
  'react-native': '0.52.0',
};

const WEB_DEFAULT_DEPENDENCIES = {
  'expo-web': '^0.0.12',
  'react-dom': '16.0.0',
  'react-native-web': '^0.4.0',
  webpack: '^3.11.0',
  'webpack-dev-server': '2.9.4',
};

// TODO figure out how this interacts with ejection
const DEFAULT_DEV_DEPENDENCIES = {
  'jest-expo': '25.0.0',
  'react-test-renderer': '16.2.0',
};

const WEB_DEFAULT_DEV_DEPENDENCIES = {
  'react-native-scripts': 'next',
  'babel-loader': '^7.1.2',
  'babel-plugin-expo-web': '^0.0.5',
  'babel-plugin-react-native-web': '^0.4.0',
  'babel-plugin-transform-decorators-legacy': '^1.3.4',
  'babel-plugin-transform-imports': '^1.4.1',
  'babel-plugin-transform-runtime': '^6.23.0',
  'file-loader': '^1.1.7',
  'css-loader': '^0.28.7',
  'style-loader': '^0.19.0',
};

const arg = minimist(process.argv.slice(2), {
  boolean: ['with-web-support'],
});

module.exports = async (appPath: string, appName: string, verbose: boolean, cwd: string = '') => {
  const ownPackageName: string = require('../../package.json').name;
  const ownPath: string = path.join(appPath, 'node_modules', ownPackageName);
  const useYarn: boolean = hasYarn(appPath);
  const npmOrYarn = useYarn ? 'yarn' : 'npm';

  // FIXME(perry) remove when npm 5 is supported
  if (!useYarn) {
    let npmVersion = spawn.sync('npm', ['--version']).stdout.toString().trim();

    if (npmVersion.match(/\d+/)[0] === '5') {
      console.log(
        chalk.yellow(
          `
*******************************************************************************
ERROR: npm 5 is not supported yet
*******************************************************************************

It looks like you're using npm 5 which was recently released.

Create React Native App doesn't work with npm 5 yet, unfortunately. We
recommend using npm 4 or yarn until some bugs are resolved.

You can follow the known issues with npm 5 at:
https://github.com/npm/npm/issues/16991

*******************************************************************************
 `
        )
      );
      process.exit(1);
    }
  }

  const readmeExists: boolean = await pathExists(path.join(appPath, 'README.md'));
  if (readmeExists) {
    await fse.rename(path.join(appPath, 'README.md'), path.join(appPath, 'README.old.md'));
  }

  const appPackagePath: string = path.join(appPath, 'package.json');
  const appPackage = JSON.parse(await fse.readFile(appPackagePath));

  // mutate the default package.json in any ways we need to
  appPackage.main = './node_modules/react-native-scripts/build/bin/crna-entry.js';
  appPackage.scripts = {
    start: 'react-native-scripts start',
    eject: 'react-native-scripts eject',
    android: 'react-native-scripts android',
    ios: 'react-native-scripts ios',
    test: 'jest',
  };

  const withWebSupport = arg['with-web-support'];
  if (withWebSupport) {
    appPackage.main = './node_modules/react-native-scripts/build/bin/crna-entry-web.js';
    Object.assign(appPackage.scripts, {
      web: 'webpack-dev-server -d --config ./webpack.config.js  --inline --hot --colors --content-base public/ --history-api-fallback',
      build: 'NODE_ENV=production webpack -p --config ./webpack.config.js',
    });
  }

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

  if (withWebSupport) {
    Object.assign(appPackage.dependencies, WEB_DEFAULT_DEPENDENCIES);
    Object.assign(appPackage.devDependencies, WEB_DEFAULT_DEV_DEPENDENCIES);
  }

  // Write the new appPackage after copying so that we can include any existing
  await fse.writeFile(appPackagePath, JSON.stringify(appPackage, null, 2));

  // Copy the files for the user
  await fse.copy(
    path.join(ownPath, arg['with-web-support'] ? 'template-with-web' : 'template'),
    appPath
  );

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  try {
    await fse.rename(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'));
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = await fse.readFile(path.join(appPath, 'gitignore'));
      await fse.appendFile(path.join(appPath, '.gitignore'), data);
      await fse.unlink(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }
  const { code, command, args } = await install(appPath);
  if (code !== 0) {
    console.error('Failed to install');
    // console.error(`\`${command} ${args.join(' ')}\` failed`);
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

  log(
    `
Success! Created ${appName} at ${appPath}
Inside that directory, you can run several commands:

  ${chalk.cyan(npmOrYarn + ' start')}
    Starts the development server so you can open your app in the Expo
    app on your phone.

  ${chalk.cyan(npmOrYarn + ' run ios')}
    (Mac only, requires Xcode)
    Starts the development server and loads your app in an iOS simulator.

  ${chalk.cyan(npmOrYarn + ' run android')}
    (Requires Android build tools)
    Starts the development server and loads your app on a connected Android
    device or emulator.
  ${withWebSupport ? webLogMessage(npmOrYarn) : '\n'}
  ${chalk.cyan(npmOrYarn + ' test')}
    Starts the test runner.

  ${chalk.cyan(npmOrYarn + ' run eject')}
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!


We suggest that you begin by typing:

  ${chalk.cyan('cd ' + cdpath)}
  ${chalk.cyan(npmOrYarn + ' start')}`
  );

  if (readmeExists) {
    log(
      `
${chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`')}`
    );
  }

  log();
  log('Happy hacking!');
};

function webLogMessage(npmOrYarn) {
  return `
  ${chalk.cyan(npmOrYarn + ' web')}
    Starts the Webpack server to serve the web version of the app.
  `;
}
