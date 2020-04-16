// @ts-ignore
import { ensureDirSync } from 'fs-extra';
import os from 'os';
import { join } from 'path';

let mkdirped = false;

export function dotExpoHomeDirectory() {
  let dirPath;
  if (process.env.__UNSAFE_EXPO_HOME_DIRECTORY) {
    dirPath = process.env.__UNSAFE_EXPO_HOME_DIRECTORY;
  } else {
    const home = os.homedir();
    if (!home) {
      throw new Error(
        "Can't determine your home directory; make sure your $HOME environment variable is set."
      );
    }

    if (process.env.EXPO_STAGING) {
      dirPath = join(home, '.expo-staging');
    } else if (process.env.EXPO_LOCAL) {
      dirPath = join(home, '.expo-local');
    } else {
      dirPath = join(home, '.expo');
    }
  }
  if (!mkdirped) {
    ensureDirSync(dirPath);
    mkdirped = true;
  }
  return dirPath;
}
