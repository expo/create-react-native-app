// @flow

import { ProjectSettings } from 'xdl';

import ipAddress from 'address';
import chalk from 'chalk';
import indent from 'indent-string';
import qr from 'qrcode-terminal';

import packager from '../util/packager';

import { Config } from 'xdl';
Config.validation.reactNativeVersionWarnings = false;
Config.developerTool = 'crna';
Config.offline = true;

packager.run(printServerInfo);

// print a nicely formatted message with setup information
async function printServerInfo() {
  const settings = await ProjectSettings.readPackagerInfoAsync(process.cwd());
  // who knows why qrcode-terminal takes a callback instead of just returning a string
  const address = `exp://${ipAddress.ip()}:${settings.exponentServerPort}`;
  qr.generate(address, (qrCode) => {
    console.log(`${chalk.green('Packager started!')}

To view your app with live reloading, point the Exponent app to this QR code:

${indent(qrCode, 2)}

You'll find the QR scanner on the Projects tab of the app, under the '+' menu.

Or enter this address in the search bar:

  ${chalk.underline(chalk.cyan(address))}

Your phone will need to be on the same local network as this computer.

For links to install the Exponent app, please visit ${chalk.underline(chalk.cyan('https://getexponent.com'))}.

Logs from serving your app will appear here. Press Ctrl+C at any time to stop.
`);
  });
}
