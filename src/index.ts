#!/usr/bin/env node
import chalk from 'chalk';

console.warn(chalk`
{yellow.bold ⚠️ This tool does not initialize new React Native projects.}

It's recommended to use a framework to build apps with React Native, for example:

  Expo:
    {bold npx create-expo-app}
  
  React Native Community template:
    {bold npx @react-native-community/cli init}
  
Learn more: {underline https://reactnative.dev/docs/environment-setup}
`);

process.exit(1);
