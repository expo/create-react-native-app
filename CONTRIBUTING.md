# Contributing to Expo CLI

## How to contribute

You can contribute to Expo development tools in various ways, including:

- [Reporting bugs or issues](https://github.com/expo/create-react-native-app/issues/new) on GitHub. Please make sure to include fill in all the details in the issue template to make sure the issue can be addressed as quickly as possible.
- [Submitting improvements to the documentation](https://github.com/expo/expo-docs). Updates, enhancements, new guides, spelling fixes...
- Helping other people on the [forums](https://forums.expo.io).
- Looking at existing [issues](https://github.com/expo/create-react-native-app/issues) and adding more information, particularly helping to reproduce the issues.
- [Submitting a pull request](#submitting-a-pull-request) with a bug fix or an improvement.

### Branches

The `master` branch of the repository should be kept releasable at any time. This way we can continuously deploy fixes and improvements without costly managing of different branches and issues will be noticed and fixed quickly. This also ensures other contributors can check out the latest version from GitHub and work on it with minimal disruption from other features in progress.

Keeping the `master` releasable means that changes merged to it need to be:

- **Backwards compatible**: Expo CLI should work with _every currently supported Expo SDK version_. If the code you're adding depends on a feature only present in newer or unreleased SDK versions, it needs to check which SDK version is being used and not assume the latest version is being used.
- **Non-breaking**: If code that is unreleasable or fails the test suite ends up in `master`, it should be reverted.
- **Tested**: Always include a test plan in pull requests. Do not merge code that doesn't pass all automated tests.

## Setting up the repository for development

1. Clone the repository.
2. Run `yarn run bootstrap`. (Installs dependencies, links and builds packages.)
3. Run `git config commit.template .github/.COMMIT_TEMPLATE` (Sets you up with our commit message template)

You can then run `yarn start` in the root folder to start watching and automatically re-building packages when there are new changes.

## Submitting a pull request

To submit a pull request:

1. Fork the [repository](https://github.com/expo/create-react-native-app) and create a feature branch. (Existing contributors can create feature branches without forking. Prefix the branch name with `@your-github-username/`.)
2. Write the description of your pull request. Make sure to include a test plan and test your changes.
3. Make sure all tests pass on CircleCI.
4. Wait for a review and adjust the code if necessary.

## Publishing a release

To publish a new release, run this command (you must have two-factor authentication enabled for npm):

```
node ./scripts/publish.js
```

The command will bump the versions of all packages with changes since the previous release and publish them in the correct order. For each changed package, it will ask, if the changes require a new _major_ version (breaking changes), _minor_ version (new backwards compatible functionality) or just a _patch_ version (backwards compatible bug fixes).

### Canary release

If you wish to publish a canary version, please run:

```
yarn run publish --canary
```
