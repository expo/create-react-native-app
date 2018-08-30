#!/usr/bin/env node
'use strict';
import spawn from 'cross-spawn';

const script = process.argv[2];
const args = process.argv.slice(3);

if (script === 'start' || script === 'eject') {
  runExpoCli(script, ...args);
} else if (script === 'android' || script === 'ios') {
  runExpoCli('start', `--${script}`, ...args);
} else {
  console.log(
    `Invalid command '${script}'. Please check if you need to update react-native-scripts.`
  );
  process.exit(1);
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
