// @flow

import chalk from 'chalk';
import fsp from 'fs-promise';
import inquirer from 'inquirer';
import matchRequire from 'match-require';
import path from 'path';

import { detach } from '../util/exponent';

async function eject() {
  try {
    const filesWithExponent = await filesUsingExponentSdk();
    const usingExponent = filesWithExponent.length > 0;

    let exponentSdkWarning;
    if (usingExponent) {
      exponentSdkWarning =
`${chalk.bold('Warning!')} We found at least one file where your project imports the Exponent SDK:
`;

      for (let filename of filesWithExponent) {
        exponentSdkWarning += `  ${chalk.cyan(filename)}\n`;
      }

      exponentSdkWarning += `
${chalk.yellow.bold('If you choose the "plain" React Native option below, these imports will stop working.')}`
    } else {
      exponentSdkWarning = `\
We didn't find any uses of the Exponent SDK in your project, so you should be fine to eject to
"Plain" React Native. (This check isn't very sophisticated, though.)`
    }

    console.log(`
${exponentSdkWarning}

We ${chalk.italic('strongly')} recommend that you read this document before you proceed:
  ${chalk.cyan('https://github.com/react-community/create-react-native-app/blob/master/EJECTING.md')}

Ejecting is permanent! Please be careful with your selection.
`);

  const questions = [
    {
      type: 'list',
      name: 'ejectMethod',
      message: 'How would you like to eject from create-react-native-app?',
      default: usingExponent ? 'exponentKit' : 'raw',
      choices: [
        {
          name: 'React Native: I\'d like a regular React Native project.',
          value: 'raw',
        },
        {
          name: 'ExponentKit: I\'ll create or log in with an Exponent account to use React Native and the Exponent SDK.',
          value: 'exponentKit',
        },
        {
          name: 'Cancel: I\'ll continue with my current project structure.',
          value: 'cancel',
        },
      ],
    },
  ];

  const { ejectMethod } = await inquirer.prompt(questions);

  if (ejectMethod === 'raw') {
    // TODO implement
    // TODO remove exponent deps from package.json?
    throw new Error('This hasn\'t been built yet!');

  } else if (ejectMethod === 'exponentKit') {
    await detach();

  } else {
    // we don't want to print the survey for cancellations
    console.log('OK! If you change your mind you can run this command again.');
    return;
  }

  console.log(`${chalk.green('Ejected successfully!')}
Please consider letting us know why you ejected in this survey:
  ${chalk.cyan('https://goo.gl/forms/iD6pl218r7fn9N0d2')}`);

  } catch (e) {
    console.error(chalk.red(`Error running eject: ${e}`));
  }
}

async function filesUsingExponentSdk(): Promise<Array<string>> {
  const projectJsFiles = await findJavaScriptProjectFilesInRoot(process.cwd());

  const jsFileContents = (await Promise.all(
    projectJsFiles
      .map((f) => fsp.readFile(f))))
      .map((buf, i) => {
        return {
          filename: projectJsFiles[i],
          contents: buf.toString(),
        };
      });

  const filesUsingExponent = [];

  for (let { filename, contents } of jsFileContents) {
    const requires = matchRequire.findAll(contents);

    if (requires.includes('exponent')) {
      filesUsingExponent.push(filename);
    }
  }

  filesUsingExponent.sort();

  return filesUsingExponent;
}

async function findJavaScriptProjectFilesInRoot(root: string): Promise<Array<string>> {
  // ignore node_modules
  if (root.includes('node_modules')) {
    return [];
  }

  const stats = await fsp.stat(root);

  if (stats.isFile()) {
    if (root.endsWith('.js')) {
      return [ root ];
    } else {
      return [];
    }
  } else if (stats.isDirectory()) {

    const children = await fsp.readdir(root);

    // we want to do this concurrently in large project folders
    const jsFilesInChildren = await Promise.all(
      children.map((f) => findJavaScriptProjectFilesInRoot(path.join(root, f))));

    return [].concat.apply([], jsFilesInChildren);
  } else {
    // lol it's not a file or directory, we can't return a honey badger, 'cause it don't give a
    return [];
  }
}

eject().then(() => {
  // the exponent local github auth server leaves a setTimeout for 5 minutes
  // so we need to explicitly exit (for now, this will be resolved in the nearish future)
  process.exit(0);
});
