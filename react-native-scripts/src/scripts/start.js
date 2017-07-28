// @flow

import { Android, Config, Project, ProjectSettings, Simulator, UrlUtils } from 'xdl';

import chalk from 'chalk';
import indent from 'indent-string';
import qr from 'qrcode-terminal';
import minimist from 'minimist';
import log from '../util/log';
import clearConsole from '../util/clearConsole';

import packager from '../util/packager';

Config.validation.reactNativeVersionWarnings = false;
Config.developerTool = 'crna';
Config.offline = true;

const args = minimist(process.argv.slice(2), {
  boolean: ['reset-cache', 'interactive'],
  default: { interactive: true },
});
let dev = true;

const options = {};
if (args['reset-cache']) {
  options.reset = true;
  log('Asking packager to reset its cache...');
}

let isInteractive = false;
const { stdin } = process;
if (args.interactive && typeof stdin.setRawMode === 'function') {
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.on('data', handleKeypress);
  isInteractive = true;
}

packager.run(onReady, options, isInteractive);

function onReady() {
  log(chalk.green('Packager started!\n'));
  printServerInfo();
}

// print a nicely formatted message with setup information
async function printServerInfo() {
  const settings = await ProjectSettings.readPackagerInfoAsync(process.cwd());
  // who knows why qrcode-terminal takes a callback instead of just returning a string
  const address = await UrlUtils.constructManifestUrlAsync(process.cwd());
  qr.generate(address, qrCode => {
    log(
      `To view your app with live reloading, point the Expo app to this QR code.
You'll find the QR scanner on the Projects tab of the app.

${indent(qrCode, 2)}

Or enter this address in the Expo app's search bar:

  ${chalk.underline(chalk.cyan(address))}

Your phone will need to be on the same local network as this computer.
For links to install the Expo app, please visit ${chalk.underline(chalk.cyan('https://expo.io'))}.

Logs from serving your app will appear here. Press Ctrl+C at any time to stop.`
    );
    printUsage();
  });
}

function printUsage() {
  if (!isInteractive) {
    return;
  }
  const { dim, bold } = chalk;
  const devMode = dev ? 'development' : 'production';
  const iosInfo = process.platform === 'win32'
    ? dim('.')
    : `${dim(`, or`)} i ${dim(`to open iOS emulator.`)}`;
  log(
    `
 ${dim(`\u203A Press`)} a ${dim(`to open Android device or emulator`)}${iosInfo}
 ${dim(`\u203A Press`)} q ${dim(`to display QR code.`)}
 ${dim(`\u203A Press`)} r ${dim(`to restart packager, or`)} R ${dim(`to restart packager and clear cache.`)}
 ${dim(`\u203A Press`)} d ${dim(`to toggle development mode. (current mode: ${bold(devMode)}${chalk.reset.dim(')')}`)}
`
  );
}

const CTRL_C = '\u0003';
const CTRL_D = '\u0004';

async function handleKeypress(key) {
  switch (key) {
    case CTRL_C:
    case CTRL_D:
      process.emit('SIGINT');
      return;
    case 'a': {
      clearConsole();
      log.withTimestamp('Starting Android...');
      const { success, error } = await Android.openProjectAsync(process.cwd());
      if (!success) {
        log(chalk.red(error.message));
      }
      printUsage();
      return;
    }
    case 'i': {
      clearConsole();
      log.withTimestamp('Starting iOS...');
      const localAddress = await UrlUtils.constructManifestUrlAsync(process.cwd(), {
        hostType: 'localhost',
      });
      const { success, msg } = await Simulator.openUrlInSimulatorSafeAsync(localAddress);
      if (!success) {
        log(chalk.red(msg));
      }
      printUsage();
      return;
    }
    case 'q':
      clearConsole();
      await printServerInfo();
      return;
    case 'r':
    case 'R': {
      clearConsole();
      const reset = key === 'R';
      if (reset) {
        log.withTimestamp('Asking packager to reset its cache...');
      }
      log.withTimestamp('Restarting packager...');
      Project.startAsync(process.cwd(), { reset });
      return;
    }
    case 'd':
      clearConsole();
      dev = !dev;
      await ProjectSettings.setAsync(process.cwd(), { dev });
      log(
        `Packager now running in ${chalk.bold(dev ? 'development' : 'production')}${chalk.reset(` mode.`)}

Please close and reopen the project in the Expo app for the
change to take effect.`
      );
      printUsage();
      return;
  }
}
