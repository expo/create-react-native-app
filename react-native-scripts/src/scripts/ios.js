import { Config, ProjectSettings, Simulator, UrlUtils } from 'xdl';

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

if (!Simulator.isPlatformSupported()) {
  console.log(
    chalk.red(
      '\nThis command only works on macOS computers with Xcode and the iOS simulator installed.'
    )
  );
  console.log(
    chalk.yellow(
      `If you run \`${chalk.cyan(command + ' start')}\` then you can view your app on a physical device.\n`
    )
  );
  process.exit(1);
}

packager.run(startSimulatorAndPrintInfo);

// print a nicely formatted message with setup information
async function startSimulatorAndPrintInfo() {
  const address = await UrlUtils.constructManifestUrlAsync(process.cwd());
  const localAddress = await UrlUtils.constructManifestUrlAsync(process.cwd(), {
    hostType: 'localhost',
  });

  console.log('Starting simulator...');
  const { success, msg } = await Simulator.openUrlInSimulatorSafeAsync(localAddress);

  if (success) {
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

If you restart the simulator or change the simulated hardware, you may need to restart this process.
`
      );
    });
  } else {
    console.log(
      `${chalk.red('Failed to start simulator:')}

${msg}

${chalk.red('Exiting...')}`
    );
    process.exit(0);
  }
}
