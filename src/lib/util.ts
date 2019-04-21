import path from 'path';
import fs from 'fs-extra';

const LOADS: any = {};

/**
 * Loads the files in the specified directory
 *
 * @param {*} directory
 * @param {string} [rootDir=path.resolve(__dirname, '..')]
 * @returns
 */
export const load = (
  directory: string,
  rootDir = path.resolve(__dirname, '..'),
) => {
  directory = path.resolve(rootDir, directory);
  if (LOADS[directory]) {
    return LOADS[directory];
  }
  const obj: any = {};
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);
    files.forEach(item => {
      if (path.extname(item) === '.ts') {
        // eslint-disable-next-line
        obj[path.basename(item, '.ts')] = require(path.resolve(
          directory,
          item,
        ));
      }
    });
  }
  LOADS[directory] = obj;
  return obj;
};

export default {
  load,
};