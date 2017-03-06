// @flow

import chalk from 'chalk';
import fsp from 'fs-promise';
import inquirer from 'inquirer';
import path from 'path';

import { Detach, User as UserManager } from 'xdl';

import type { User } from 'xdl/build/User';

const AUTH_CLIENT_ID = 'MGQh3rK3WZFWhJ91BShagHggMOhrE6nR';
UserManager.initialize(AUTH_CLIENT_ID);

export async function detach() {
  const user = await loginOrRegister();

  const appJsonPath = path.join(process.cwd(), 'app.json');
  const appJson = JSON.parse(await fsp.readFile(appJsonPath));

  if ((!appJson.expo.ios || !appJson.expo.ios.bundleIdentifier) && process.platform === 'darwin') {
    console.log(
      `
You'll need to specify an iOS bundle identifier. It must be unique on the App Store if you want to
publish it there. See this StackOverflow question for more information:
  ${chalk.cyan('https://stackoverflow.com/questions/11347470/what-does-bundle-identifier-mean-in-the-ios-project')}
`
    );
    const { iosBundleIdentifier } = await inquirer.prompt([
      {
        name: 'iosBundleIdentifier',
        message: 'What would you like your iOS bundle identifier to be?',
      },
    ]);

    appJson.expo.ios = appJson.expo.ios || {};
    appJson.expo.ios.bundleIdentifier = iosBundleIdentifier;
  }

  // check for android.package field, prompt interactively
  if (!appJson.expo.android || !appJson.expo.android.package) {
    console.log(
      `
You'll need to specify an Android package name. It must be unique on the Play Store if you want to
publish it there. See this StackOverflow question for more information:
  ${chalk.cyan('https://stackoverflow.com/questions/6273892/android-package-name-convention')}
`
    );

    const { androidPackage } = await inquirer.prompt([
      {
        name: 'androidPackage',
        message: 'What would you like your Android package name to be?',
      },
    ]);

    appJson.expo.android = appJson.expo.android || {};
    appJson.expo.android.package = androidPackage;
  }

  // update app.json file with new contents
  await fsp.writeFile(appJsonPath, JSON.stringify(appJson, null, 2));

  await Detach.detachAsync(process.cwd());
  // yesno lib doesn't properly shut down. without this the command won't exit
  process.stdin.pause();

  const pkgJson = JSON.parse((await fsp.readFile(path.resolve('package.json'))).toString());

  const entryPoint = `import Expo from 'expo';
import App from './App';

Expo.registerRootComponent(App);
`;
  await fsp.writeFile('index.js', entryPoint);
  pkgJson.main = 'index.js';

  delete pkgJson.scripts.start;
  delete pkgJson.scripts.build;
  delete pkgJson.scripts.eject;
  delete pkgJson.scripts.ios;
  await fsp.writeFile('package.json', JSON.stringify(pkgJson, null, 2));

  console.log(
    `${chalk.green('Successfully set up ExpoKit!')}

You'll need to use Expo's XDE to run this project:
  ${chalk.cyan('https://docs.expo.io/versions/latest/introduction/installation.html')}

For further instructions, please read ExpoKit's build documentation:
  ${chalk.cyan('https://docs.expo.io/versions/latest/guides/exponentkit.html#rerun-the-project-in-xde-or-exp')}
`
  );
}

async function loginOrRegister(): Promise<?User> {
  console.log(chalk.yellow('\nAn Expo account is required to proceed.\n'));
  const currentUser = await UserManager.getCurrentUserAsync();

  if (currentUser) {
    const loggedInQuestions = [
      {
        type: 'list',
        name: 'stayLoggedIn',
        message: `It appears you're already logged in to Expo as \
${chalk.green(currentUser.nickname)}, would you like to continue with this account?`,
        choices: [
          {
            name: `Yes, continue as ${currentUser.nickname}.`,
            value: true,
          },
          {
            name: "No, I'd like to start a new session.",
            value: false,
          },
        ],
      },
    ];

    const { stayLoggedIn } = await inquirer.prompt(loggedInQuestions);

    if (stayLoggedIn) {
      return currentUser;
    } else {
      await UserManager.logoutAsync();
      console.log(chalk.green('\nSuccessfully logged out!\n'));
    }
  }

  const questions = [
    {
      type: 'list',
      name: 'action',
      message: 'How would you like to authenticate?',
      choices: [
        {
          name: 'Make a new Expo account',
          value: 'register',
        },
        {
          name: 'Log in with an existing Expo account',
          value: 'existingUser',
        },
        {
          name: 'Cancel',
          value: 'cancel',
        },
      ],
    },
  ];

  const { action } = await inquirer.prompt(questions);

  if (action === 'github') {
    return await githubAuthAsync();
  } else if (action === 'register') {
    return await registerAsync();
  } else if (action === 'existingUser') {
    return await usernamePasswordAuthAsync();
  } else {
    return null;
  }
}

async function githubAuthAsync(): Promise<User> {
  let user = await UserManager.loginAsync('github');
  if (user) {
    console.log(chalk.green(`\nSuccessfully logged in as ${user.nickname} with GitHub!`));
    return user;
  } else {
    throw new Error('Unexpected Error: No user returned from the API');
  }
}

function validator(val: string): boolean {
  if (val.trim() === '') {
    return false;
  }
  return true;
}

async function usernamePasswordAuthAsync(): Promise<User> {
  const questions = [
    {
      type: 'input',
      name: 'username',
      message: 'Username/Email Address:',
      validate: validator,
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: validator,
    },
  ];

  const answers = await inquirer.prompt(questions);

  const data = {
    username: answers.username,
    password: answers.password,
  };

  let user = await UserManager.loginAsync('user-pass', data);

  if (user) {
    console.log(chalk.green(`\nSuccessfully logged in as ${user.nickname}!`));
    return user;
  } else {
    throw new Error('Unexpected Error: No user returned from the Expo API');
  }
}

async function registerAsync(): Promise<User> {
  console.log(
    `
Thanks for signing up for Expo!
Just a few questions:
`
  );

  const questions = [
    {
      type: 'input',
      name: 'givenName',
      message: 'First (Given) Name:',
      validate: validator,
    },
    {
      type: 'input',
      name: 'familyName',
      message: 'Last (Family) Name:',
      validate: validator,
    },
    {
      type: 'input',
      name: 'username',
      message: 'Username:',
      validate: validator,
    },
    {
      type: 'input',
      name: 'email',
      message: 'Email Address:',
      validate: validator,
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: validator,
    },
    {
      type: 'password',
      name: 'passwordRepeat',
      message: 'Password Repeat:',
      validate(val, answers) {
        if (val.trim() === '') {
          return false;
        }
        if (val.trim() !== answers.password.trim()) {
          return `Passwords don't match!`;
        }
        return true;
      },
    },
  ];

  const answers = await inquirer.prompt(questions);

  const registeredUser = await UserManager.registerAsync({
    ...answers,
  });

  console.log(chalk.green('\nRegistration successful!'));

  return registeredUser;
}
