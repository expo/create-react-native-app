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
  if (process.platform === 'darwin') {
    expect(fileExists(projectName, 'ios/Pods/')).toBeTruthy();
  }
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
      'https://github.com/expo/examples/tree/master/with-animated-splash-screen',
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
    await executePassingAsync(projectName, '--template', 'with-animated-splash-screen');

    expect(fileExists(projectName, 'package.json')).toBeTruthy();
    expect(fileExists(projectName, 'App.js')).toBeTruthy();
    expect(fileExists(projectName, 'README.md')).toBeTruthy();
    expect(fileExists(projectName, '.gitignore')).toBeTruthy();
    // Check if it skipped install
    expect(fileExists(projectName, 'node_modules')).toBeTruthy();
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
      'https://github.com/expo/examples/tree/master/with-animated-splash-screen',
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
      'with-animated-splash-screen',
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
