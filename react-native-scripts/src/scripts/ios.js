import { Config, ProjectSettings, Simulator, UrlUtils } from 'xdl';

import chalk from 'chalk';
import ipAddress from 'address';
import path from 'path';
import pathExists from 'path-exists';

import packager from '../util/packager';

Config.validation.reactNativeVersionWarnings = false;
Config.developerTool = 'crna';
Config.offline = true;

const command: string = pathExists.sync(path.join(process.cwd(), 'yarn.lock')) ? 'yarnpkg' : 'npm';

if (!Simulator.isPlatformSupported()) {
  console.log(chalk.red('\nThis command only works on macOS computers with Xcode and the iOS simulator installed.'));
  console.log(chalk.yellow(`If you run \`${chalk.cyan(command + ' start')}\` then you can view your app on a physical device.\n`));
  process.exit(1);
}

packager.run(startSimulatorAndPrintInfo);

// print a nicely formatted message with setup information
async function startSimulatorAndPrintInfo() {
  const settings = await ProjectSettings.readPackagerInfoAsync(process.cwd());
  const address = UrlUtils.constructManifestUrlAsync(process.cwd());

  console.log(chalk.blue('Starting simulator...'));
  const { success, msg } = await Simulator.openUrlInSimulatorSafeAsync(address);

  if (success) {
    console.log(`${chalk.green('Packager and simulator started!')}

Logs from serving your app will appear here. Press Ctrl+C at any time to stop.

If you restart the simulator or change the simulated hardware, you may need to restart this process.
`);
  } else {
    console.log(`${chalk.red('Failed to start simulator:')}

${msg}

${chalk.red('Exiting...')}`);
    process.exit(0);
  }
}
