/* eslint-env jest */
import execa from 'execa';
import { existsSync } from 'fs';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const cli = require.resolve('../build/index.js');

const projectRoot = getTemporaryPath();

function getTemporaryPath() {
  return path.join(
    os.tmpdir(),
    Math.random()
      .toString(36)
      .substring(2)
  );
}

function execute(...args) {
  return execa('node', [cli, ...args], { cwd: projectRoot });
}

async function executePassingAsync(...args) {
  const results = await execute(...args);
  expect(results.exitCode).toBe(0);
  return results;
}

function executeDefaultAsync(...args) {
  const res = execute(...args);

  // When the test is prompted to use the default, it'll select it automatically.
  res.stdout.on('data', data => {
    const stdout = data.toString();
    if (/How would you like to start/.test(stdout)) {
      res.stdin.write('\n');
    }
  });

  return res;
}

function fileExists(projectName, filePath) {
  return existsSync(path.join(projectRoot, projectName, filePath));
}

function getRoot(...args) {
  return path.join(projectRoot, ...args);
}

// 3 minutes -- React Native takes a while to install
const extendedTimeout = 3 * 1000 * 60;

beforeAll(async () => {
  jest.setTimeout(extendedTimeout);
  await fs.mkdirp(projectRoot);
});

it('prevents overwriting directories with projects', async () => {
  const projectName = 'cannot-overwrite-files';
  const projectRoot = getRoot(projectName);
  // Create the project root aot
  await fs.mkdirp(projectRoot);
  // Create a fake package.json -- this is a terminal file that cannot be overwritten.
  fs.writeFileSync(path.join(projectRoot, 'package.json'), '{ "version": "1.0.0" }');

  expect.assertions(1);
  try {
    await executeDefaultAsync(projectName);
  } catch (e) {
    expect(e.stdout).toMatch(/has files that might be overwritten/);
  }
});

it('creates a full bare project by default', async () => {
  const projectName = 'defaults-to-bare';
  await executeDefaultAsync(projectName, '--install');

  expect(fileExists(projectName, 'package.json')).toBeTruthy();
  expect(fileExists(projectName, 'App.js')).toBeTruthy();
  expect(fileExists(projectName, '.gitignore')).toBeTruthy();
  expect(fileExists(projectName, 'node_modules')).toBeTruthy();
  expect(fileExists(projectName, 'ios/')).toBeTruthy();
  expect(fileExists(projectName, 'android/')).toBeTruthy();
  expect(fileExists(projectName, 'app.json')).toBeTruthy();
  if (process.platform === 'darwin') {
    expect(fileExists(projectName, 'ios/Pods/')).toBeTruthy();
  }
  // Ensure the app.json is written properly
  const appJsonPath = path.join(projectRoot, projectName, 'app.json');
  const appJson = JSON.parse(await fs.readFile(appJsonPath, 'utf8'));
  expect(appJson.name).toBe(projectName);
  expect(appJson.expo.name).toBe(projectName);
  expect(appJson.expo.slug).toBe(projectName);
});

describe('yes', () => {
  it('creates a default project in the current directory', async () => {
    const projectName = 'yes-default-directory';
    const projectRoot = getRoot(projectName);
    // Create the project root aot
    await fs.mkdirp(projectRoot);

    const results = await execa('node', [cli, '--yes', '--no-install'], { cwd: projectRoot });
    expect(results.exitCode).toBe(0);

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });
  it('creates a default project in a new directory', async () => {
    const projectName = 'yes-new-directory';

    const results = await execa('node', [cli, projectName, '-y', '--no-install'], {
      cwd: projectRoot,
    });
    expect(results.exitCode).toBe(0);

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });
  it('creates a default project in a new directory with a custom template', async () => {
    const projectName = 'yes-custom-template';

    const results = await execa(
      'node',
      [cli, projectName, '--yes', '--template', 'blank', '--no-install'],
      {
        cwd: projectRoot,
      }
    );
    expect(results.exitCode).toBe(0);

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });
});

describe('templates', () => {
  it('allows overwriting directories with tolerable files', async () => {
    const projectName = 'can-overwrite';
    const projectRoot = getRoot(projectName);
    // Create the project root aot
    await fs.mkdirp(projectRoot);
    // Create a fake package.json -- this is a terminal file that cannot be overwritten.
    fs.writeFileSync(path.join(projectRoot, 'LICENSE'), 'hello world');

    await executePassingAsync(
      projectName,
      '--template',
      'https://github.com/expo/examples/tree/master/blank',
      '--no-install'
    );
    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });

  it('throws when an invalid template is used', async () => {
    const projectName = 'invalid-template-name';
    expect.assertions(2);
    try {
      await execute(
        projectName,
        '--template',
        'fake template path that is too obviously long to be real'
      );
    } catch (e) {
      expect(e.stderr).toMatch(/Could not locate the template/i);
    }
    expect(fs.existsSync(getRoot(projectName, 'package.json'))).toBeFalsy();
  });

  it('downloads a valid template', async () => {
    const projectName = 'valid-template-name';
    await executePassingAsync(projectName, '--template', 'blank');

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, 'README.md')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    // Check if it skipped install
    expect(fileExists(projectName, 'node_modules')).toBeTruthy();
  });

  it(`doesn't prompt to install cocoapods in a project without an ios folder`, async () => {
    const projectName = 'no-install-no-pods-no-prompt';
    const results = await executePassingAsync(projectName, '--template', 'blank', '--no-install');

    // Ensure it doesn't warn to install pods since blank doesn't have an ios folder.
    expect(results.stdout).not.toMatch(/make sure you have CocoaPods installed/);
    expect(results.stdout).not.toMatch(/npx pod-install/);

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    // Ensure it skipped install
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });

  it('uses npm', async () => {
    const projectName = 'uses-npm';
    const results = await executeDefaultAsync(projectName, '--use-npm', '--no-install');

    // Test that the user was warned about deps
    expect(results.stdout).toMatch(/make sure you have node modules installed/);
    expect(results.stdout).toMatch(/npm install/);
    if (process.platform === 'darwin') {
      expect(results.stdout).toMatch(/make sure you have CocoaPods installed/);
      expect(results.stdout).toMatch(/npx pod-install/);
    }

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    // Check if it skipped install
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });

  it('downloads a github repo with sub-project', async () => {
    const projectName = 'full-url';
    const results = await executePassingAsync(
      projectName,
      '--template',
      'https://github.com/expo/examples/tree/master/blank',
      '--no-install'
    );

    // Test that the user was warned about deps
    expect(results.stdout).toMatch(/make sure you have node modules installed/);
    expect(results.stdout).toMatch(/yarn/);
    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, 'README.md')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    // Check if it skipped install
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });

  it('downloads a github repo with the template path option', async () => {
    const projectName = 'partial-url-and-path';
    await executePassingAsync(
      projectName,
      '--template',
      'https://github.com/expo/examples/tree/master',
      '--template-path',
      'blank',
      '--no-install'
    );

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, 'README.md')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    // Check if it skipped install
    expect(fileExists(projectName, 'node_modules')).not.toBeTruthy();
  });
});
