// @flow

import chalk from 'chalk';
import path from 'path';
import pathExists from 'path-exists';

const command: string = pathExists.sync(path.join(process.cwd(), 'yarn.lock')) ? 'yarn global add' : 'npm i -g';

console.log(`
You can create an optimized production build of your code and host it at a permanent public URL by running:

  ${chalk.cyan(command + ' exp')}
  ${chalk.cyan('exp publish')}

You can find instructions for deploying your app to the iOS App Store/Google Play Store/Windows Store here:

  ${chalk.underline(chalk.cyan('https://docs.createreactnativeapp.org/appstores.html'))}
`);
