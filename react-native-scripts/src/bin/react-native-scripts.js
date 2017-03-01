#!/usr/bin/env node
// @flow
import spawn from 'cross-spawn';

const script = process.argv[2];
const args = process.argv.slice(3);

const validCommands = [
  'eject',
  'android',
  'ios',
  'start',
  'test',
];

if (validCommands.indexOf(script) !== -1) {
  // the command is valid
  const result = spawn.sync(
    'node',
    ['--no-deprecation', require.resolve('../scripts/' + script)].concat(args),
    {stdio: 'inherit'}
  );
  process.exit(result.status);
} else {
  console.log(`Invalid command '${script}'. Please check if you need to update react-native-scripts.`);
}
