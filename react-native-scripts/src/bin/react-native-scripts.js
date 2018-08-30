#!/usr/bin/env node
'use strict';
import spawn from 'cross-spawn';
import chalk from 'chalk';

const script = process.argv[2];
const args = process.argv.slice(3);

if (script === 'start' || script === 'eject') {
  printDeprecationMessage();
  runExpoCli(script, ...args);
} else if (script === 'android' || script === 'ios') {
  printDeprecationMessage();
  runExpoCli('start', `--${script}`, ...args);
} else {
  console.log(
    `Invalid command '${script}'. Please check if you need to update react-native-scripts.`
  );
  process.exit(1);
}

function printDeprecationMessage() {
  console.warn(chalk.bold('Note: react-native-scripts is deprecated.\n'));
  console.warn(chalk.underline('Upgrading your project to use Expo CLI:\n'));
  console.warn('Make these changes to package.json:');
  console.warn(
    chalk.bold("1) Replace 'react-native-scripts' with 'expo' in the 'scripts' config.")
  );
  console.warn(
    `   Example:
    "scripts": {
      "start": "expo start",
      "eject": "expo eject",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "test": "jest"
    }`
  );
  console.warn(chalk.bold('2) Remove react-native-scripts from devDependencies.\n'));
  console.warn(
    chalk.bold("That's all! Expo CLI will install automatically when you run `npm start`.\n")
  );
}

function runExpoCli(...args) {
  spawn('expo-cli', args, { stdio: 'inherit' })
    .on('exit', function(code) {
      process.exit(code);
    })
    .on('error', function() {
      console.warn('This command requires Expo CLI.');
      var rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Do you want to install it globally [Y/n]? ', function(answer) {
        rl.close();
        if (/^n/i.test(answer.trim())) {
          process.exit(1);
        } else {
          console.log("Installing the package 'expo-cli'...");
          spawn('npm', ['install', '--global', '--loglevel', 'error', 'expo-cli@latest'], {
            stdio: ['inherit', 'ignore', 'inherit'],
          }).on('close', function(code) {
            if (code !== 0) {
              console.error('Installing Expo CLI failed. You can install it manually with:');
              console.error('  npm install --global expo-cli');
              process.exit(code);
            } else {
              console.log('Expo CLI installed. You can run `expo --help` for instructions.');
              runExpoCli(...args);
            }
          });
        }
      });
    });
}
