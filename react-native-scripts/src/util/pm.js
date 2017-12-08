// @flow

'use strict';

import path from 'path';
import fs from 'fs';

/**
 * check if the current path uses yarn, i.e. looking for yarn.lock in
 * the current path and up
 *  
 * @param {*} startingPath a path where we will look for yarn.lock file. 
 * Will traverse up the filesystem until we either find the file or reach the root
 * 
 * @param {boolean} useCached if true and we have a cached hasYarn result, it will be returned, otherwise go through the
 * normal lookup logic described above. mainly for optimization purpose, default is true.
 */
let _hasYarn: ?boolean;
export function hasYarn(startingPath: string, useCached: boolean = true): boolean {
  if (_hasYarn != null && useCached) {
    return _hasYarn;
  }

  _hasYarn = false;
  let p = path.normalize(startingPath);
  while (p.length > 0) {
    const yarnLock = path.resolve(p, 'yarn.lock');
    try {
      const file = path.join(p, 'yarn.lock');
      fs.accessSync(file);
      _hasYarn = true;
      break;
    } catch (e) {
      const parsed = path.parse(p);
      if (parsed.root === parsed.dir) {
        break;
      }
      p = parsed.dir;
    }
  }
  return _hasYarn;
}
