// @flow

import { Config, ProjectSettings, UrlUtils } from 'xdl';

import chalk from 'chalk';
import indent from 'indent-string';
import qr from 'qrcode-terminal';

import packager from '../util/packager';

Config.validation.reactNativeVersionWarnings = false;
Config.developerTool = 'crna';
Config.offline = true;

const args = require('minimist')(process.argv.slice(2), { boolean: ['--reset-cache'] });

const options = {};
if (args['reset-cache']) {
  options.reset = true;
  console.log('Asking packager to reset its cache...');
}

packager.run(printServerInfo, options);

// print a nicely formatted message with setup information
async function printServerInfo() {
  const settings = await ProjectSettings.readPackagerInfoAsync(process.cwd());
  // who knows why qrcode-terminal takes a callback instead of just returning a string
  const address = await UrlUtils.constructManifestUrlAsync(process.cwd());
  qr.generate(address, qrCode => {
    console.log(
      `${chalk.green('Packager started!')}

To view your app with live reloading, point the Expo app to this QR code.
You'll find the QR scanner on the Projects tab of the app.

${indent(qrCode, 2)}

Or enter this address in the Expo app's search bar:

  ${chalk.underline(chalk.cyan(address))}

Your phone will need to be on the same local network as this computer.

For links to install the Expo app, please visit ${chalk.underline(chalk.cyan('https://expo.io'))}.

Logs from serving your app will appear here. Press Ctrl+C at any time to stop.
`
    );
  });
}
