// @flow

import chalk from 'chalk';
import fsp from 'fs-promise';
import inquirer from 'inquirer';
import matchRequire from 'match-require';
import path from 'path';
import spawn from 'cross-spawn';

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
    const npmOrYarn = await fsp.exists(path.resolve('yarn.lock')) ? 'yarnpkg' : 'npm';
    const appJson = JSON.parse(await fsp.readFile(path.resolve('app.json')));
    const pkgJson = JSON.parse(await fsp.readFile(path.resolve('package.json')));
    let { name: newName, displayName: newDisplayName, exponent: { name: expName }} = appJson;

    // we ask user to provide a project name (default is package name stripped of dashes)
    // but we want to infer some good default choices, especially if they've set them up in app.json
    if (!newName) {
      newName = stripDashes(pkgJson.name);
    }

    if (!newDisplayName && expName) {
      newDisplayName = expName;
    }

    console.log('We have a couple of questions to ask you about how you\'d like to name your app:');
    const { enteredName, enteredDisplayname } = await inquirer.prompt([
      {
        name: 'enteredDisplayname',
        message: 'What should your app appear as on a user\'s home screen?',
        default: newDisplayName,
        validate: (s) => {
          return s.length > 0;
        }
      },
      {
        name: 'enteredName',
        message: 'What should your Android Studio and Xcode projects be called?',
        default: newName,
        validate: (s) => {
          return s.length > 0 && s.indexOf('-') === -1 && s.indexOf(' ') === -1;
        },
      },
    ]);

    appJson.name = enteredName;
    appJson.displayName = enteredDisplayname;

    console.log(chalk.blue('Writing your selections to app.json...'));
    // write the updated app.json file
    await fsp.writeFile(path.resolve('app.json'), JSON.stringify(appJson, null, 2));
    console.log(chalk.green('Wrote to app.json, please update it manually in the future.'))

    const ejectCommand = 'node';
    const ejectArgs = [path.resolve('node_modules', 'react-native', 'local-cli', 'cli.js'), 'eject'];

    const { status } = spawn.sync(ejectCommand, ejectArgs, {stdio: 'inherit'});

    if (status !== 0) {
      console.log(chalk.red(`Eject failed with exit code ${status}, see above output for any issues.`));
      console.log(chalk.yellow('You may want to delete the `ios` and/or `android` directories.'));
      process.exit(1);
    } else {
      console.log(chalk.green('Successfully copied template native code.'));
    }

    // if the project .babelrc matches the template one, then we don't need to have it around anymore
    // if it doesn't, then print a warning
    try {
      const projectBabelPath = path.resolve(process.cwd(), '.babelrc');
      const projectBabelRc = (await fsp.readFile(projectBabelPath)).toString();

      const templateBabelPath = path.resolve(__dirname, '..', '..', 'template', '.babelrc');
      const templateBabelRc = (await fsp.readFile(templateBabelPath)).toString();

      if (projectBabelRc === templateBabelRc) {
        await fsp.unlink(projectBabelPath);
        console.log(chalk.green(`The template .babelrc is no longer necessary after ejecting.
It has been successfully deleted.`));
      } else {
        console.log(chalk.yellow(`It looks like you modified your .babelrc file.
Make sure to change your babel preset to \`react-native\`.`));
      }
    } catch (e) {
      console.log(chalk.yellow(`We had an issue preparing your .babelrc for ejection.
If you have a .babelrc in your project, make sure to change the preset to \`react-native\`.`));
      console.log(chalk.red(e));
    }

    delete pkgJson.main;

    // NOTE: exponent won't work after performing a raw eject, so we should delete this
    // it will be a better error message for the module to not be found than for whatever problems
    // missing native modules will cause
    delete pkgJson.dependencies.exponent;
    delete pkgJson.devDependencies['react-native-scripts'];

    pkgJson.scripts.start = 'react-native start';
    pkgJson.scripts.ios = 'react-native run-ios';
    pkgJson.scripts.android = 'react-native run-android';

    // no longer relevant to an ejected project (maybe build is?)
    delete pkgJson.scripts.eject;

    console.log(chalk.blue(`Updating your ${npmOrYarn} scripts in package.json...`));

    await fsp.writeFile(path.resolve('package.json'), JSON.stringify(pkgJson, null, 2));

    console.log(chalk.green('Your package.json is up to date!'));

    // FIXME now we need to provide platform-specific entry points until upstream uses a single one
    console.log(chalk.blue(`Adding platform-specific entry points...`));

    const lolThatsSomeComplexCode = `import { AppRegistry } from 'react-native';
import App from './App';
AppRegistry.registerComponent('${newName}', () => App);
`;

    await fsp.writeFile(path.resolve('index.ios.js'), lolThatsSomeComplexCode);
    await fsp.writeFile(path.resolve('index.android.js'), lolThatsSomeComplexCode);

    console.log(chalk.green('Added new entry points!'));

    console.log(`
Note that using \`${npmOrYarn} start\` will now require you to run Xcode and/or
Android Studio to build the native code for your project.`);

    console.log(chalk.yellow(`
It's recommended to delete your node_modules directory and rerun ${npmOrYarn}
to ensure that the changes we made to package.json persist correctly.
`));

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

function stripDashes(s: string): string {
  let ret = '';

  for (let c of s) {
    if (c !== ' ' && c !== '-') {
      ret += c;
    }
  }

  return ret;
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
}).catch((e) => {
  console.error(`Problem running eject: ${e}`);
  process.exit(1);
});
