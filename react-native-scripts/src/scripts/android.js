import { Android, Config, ProjectSettings, UrlUtils } from 'xdl';

import chalk from 'chalk';
import indent from 'indent-string';
import path from 'path';
import pathExists from 'path-exists';
import qr from 'qrcode-terminal';

import packager from '../util/packager';

Config.validation.reactNativeVersionWarnings = false;
Config.developerTool = 'crna';
Config.offline = true;

const command: string = pathExists.sync(path.join(process.cwd(), 'yarn.lock')) ? 'yarnpkg' : 'npm';

packager.run(startAndroidAndPrintInfo);

// print a nicely formatted message with setup information
async function startAndroidAndPrintInfo() {
  const address = await UrlUtils.constructManifestUrlAsync(process.cwd());
  console.log(chalk.blue('Starting Android...'));

  const { success, error } = await Android.openProjectAsync(process.cwd());

  qr.generate(address, qrCode => {
    console.log(
      `To view your app with live reloading, point the Expo app to this QR code. You'll find the QR scanner on the Projects tab of the app, under the '+' menu.

${indent(qrCode, 2)}

Or enter this address in the Expo app's search bar:

  ${chalk.underline(chalk.cyan(address))}

Your phone will need to be on the same local network as this computer.

For links to install the Expo app, please visit ${chalk.underline(chalk.cyan('https://expo.io'))}.

Logs from serving your app will appear here. Press Ctrl+C at any time to stop.
`
    );
  });

  if (!success) {
    console.log(chalk.red(error.message));
  }
}
