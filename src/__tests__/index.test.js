/* eslint-env jest */
import execa from 'execa';

const cli = require.resolve('../../build/index.js');
const execute = () => execa('node', [cli]).catch((error) => error);

it('exits with error code', async () => {
  expect(await execute()).toMatchObject({ exitCode: 1 });
});

it('logs deprecation warning', async () => {
  expect(await execute()).toMatchObject({
    stderr: expect.stringContaining('This tool does not initialize new React Native projects'),
  });
});

it('logs next step', async () => {
  expect(await execute()).toMatchObject({
    stderr: expect.stringContaining(
      `It's recommended to use a framework to build apps with React Native`
    ),
  });
});

it('logs expo as alternative', async () => {
  expect(await execute()).toMatchObject({
    stderr: expect.stringContaining(`npx create-expo-app`),
  });
});

it('logs @react-native-community/cli as alternative', async () => {
  expect(await execute()).toMatchObject({
    stderr: expect.stringContaining(`npx @react-native-community/cli init`),
  });
});

it('logs more information link', async () => {
  expect(await execute()).toMatchObject({
    stderr: expect.stringContaining('https://reactnative.dev/docs/environment-setup'),
  });
});
