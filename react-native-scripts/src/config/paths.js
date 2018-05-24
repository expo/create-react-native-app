import path from 'path';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

export default {
  appJson: resolveApp('app.json'),
  packageJson: resolveApp('package.json'),
};
