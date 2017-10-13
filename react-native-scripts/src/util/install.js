// @flow

import spawn from 'cross-spawn';
import pathExists from 'path-exists';
import path from 'path';
import log from '../util/log';

type InstallResult = {
  code: number,
  command: string,
  args: Array<string>,
};

export default (async function install(
  appPath: string,
  packageName?: string,
  packageVersion?: string,
  options?: any = {}
): Promise<InstallResult> {
  const useYarn: boolean = await pathExists(path.join(appPath, 'yarn.lock'));

  let command = '';
  let args = [];

  if (useYarn) {
    command = 'yarnpkg';
    if (packageName) {
      args = ['add'];
    }
  } else {
    command = 'npm';
    args = ['install', '--save'];

    // if (verbose) {
    //   args.push('--verbose');
    // }
  }

  let pkg = packageName;
  if (pkg) {
    if (packageVersion) {
      pkg = `${pkg}@${packageVersion}`;
    }

    args.push(pkg);
  }

  const npmOrYarn = useYarn ? 'yarn' : 'npm';
  log(`Installing ${pkg ? pkg : 'dependencies'} using ${npmOrYarn}...`);
  log();

  let spawnOpts = {};
  if (options.silent) {
    spawnOpts.silent = true;
  } else {
    spawnOpts.stdio = 'inherit';
  }

  const proc = spawn(command, args, spawnOpts);
  return new Promise(resolve => {
    proc.on('close', code => resolve({ code, command, args }));
  });
});
