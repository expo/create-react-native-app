// @flow

import chalk from 'chalk';
import inquirer from 'inquirer';

import {
  User as UserManager,
} from 'xdl';

import type {
  User,
} from 'xdl/build/User';

const AUTH_CLIENT_ID = 'MGQh3rK3WZFWhJ91BShagHggMOhrE6nR';
UserManager.initialize(AUTH_CLIENT_ID);

export async function detach() {
  const user = await loginOrRegister();
}

async function loginOrRegister(): Promise<?User> {
  console.log(chalk.yellow('\nAn Exponent account is required to proceed.\n'));
  const currentUser = await UserManager.getCurrentUserAsync();

  if (currentUser) {
    const loggedInQuestions = [
      {
        type: 'list',
        name: 'stayLoggedIn',
        message: `It appears you're already logged in to Exponent as \
${chalk.green(currentUser.nickname)}, would you like to continue with this account?`,
        choices: [
          {
            name: `Yes, continue as ${currentUser.nickname}.`,
            value: true,
          },
          {
            name: 'No, I\'d like to start a new session.',
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
          name: 'Log in with GitHub (opens a browser tab)',
          value: 'github',
        },
        {
          name: 'Make a new Exponent account',
          value: 'register',
        },
        {
          name: 'Log in with an existing Exponent account',
          value: 'existingUser',
        },
        {
          name: 'Cancel',
          value: 'cancel',
        },
      ]
    }
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
    throw new Error("Unexpected Error: No user returned from the API");
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
    }
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
    throw new Error("Unexpected Error: No user returned from the Exponent API");
  }
}

async function registerAsync(): Promise<User> {
    console.log(`
Thanks for signing up for Exponent!
Just a few questions:
`);

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
    }
  ];

  const answers = await inquirer.prompt(questions);

  const registeredUser = await UserManager.registerAsync({
    ...answers,
  });

  console.log(chalk.green('\nRegistration successful!'));

  return registeredUser;
}
