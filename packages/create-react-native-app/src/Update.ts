import chalk from 'chalk';
import { execSync } from 'child_process';
import checkForUpdate from 'update-check';

export function shouldUseYarn(): boolean {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch {}
  return false;
}

const packageJson = require('../package.json');

export default async function shouldUpdate(): Promise<void> {
  const update = checkForUpdate(packageJson).catch(() => null);

  try {
    const res = await update;
    if (res && res.latest) {
      const isYarn = shouldUseYarn();

      console.log();
      console.log(chalk.yellow.bold(`A new version of \`${packageJson.name}\` is available`));
      console.log(
        'You can update by running: ' +
          chalk.magenta(
            isYarn ? `yarn global add ${packageJson.name}` : `npm install -g ${packageJson.name}`
          )
      );
      console.log();
    }
  } catch {
    // ignore error
  }
}
