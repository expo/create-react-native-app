This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

Below you'll find information about performing common tasks. The most recent version of this guide is available [here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).

## Table of Contents

* [Updating to New Releases](#updating-to-new-releases)
* [Available Scripts](#available-scripts)
  * [npm start](#npm-start)
  * [npm test](#npm-test)
  * [npm run ios](#npm-run-ios)
  * [npm run eject](#npm-run-eject)
* [Writing and Running Tests](#writing-and-running-tests)
* [Sharing & Deployment](#sharing-deployment)
  * [Publishing to Exponent's React Native Community](#publishing-to-exponents-react-native-community)
  * [Building an Exponent "standalone" app](#building-an-exponent-standalone-app)
  * [Ejecting from Create React Native App](#ejecting-from-create-react-native-app)
    * [Build Dependencies (Xcode & Android Studio)](#build-dependencies-xcode-android-studio)
    * [Should I Use ExponentKit?](#should-i-use-exponentkit)

## Updating to New Releases

You should only need to update the global installation of `create-react-native-app` very rarely, ideally never.

Updating the `react-native-scripts` dependency of your app should be as simple as bumping the version number in `package.json` and reinstalling your project's dependencies.

Upgrading to a new version of React Native requires updating the `react-native`, `react`, and `exponent` package versions, and setting the correct `sdkVersion` in `app.json`. See the [versioning guide](https://github.com/react-community/create-react-native-app/blob/master/VERSIONS.md) for up-to-date information about package version compatibility.

## Available Scripts

If yarn was installed when the project was initialized, then dependencies will have been installed via yarn, and you should probably use it to run these commands as well. Unlike dependency installation, command running syntax is identical for yarn and npm at the time of this writing.

### `npm start`

Runs your app in development mode.

Open it in the [Exponent app](https://getexponent.com) on your phone to view it. It will reload if you save edits to your files, and you will see build errors and logs in the terminal.

#### `npm test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.

#### `npm run ios`

Like `npm start`, but also attempts to open the iOS Simulator if you're on a Mac and have it installed.

#### `npm run eject`

This will start the process of "ejecting" from Create React Native App's build scripts. You'll be asked a couple of questions about how you'd like to build your project.

**Warning:** Running eject is a permanent action (aside from whatever version control system you use). An ejected app will require you to have an [Xcode and/or Android Studio environment](https://facebook.github.io/react-native/docs/getting-started.html) set up.

## Writing and Running Tests

This project is set up to use [jest](https://facebook.github.io/jest/) for tests. You can configure whatever testing strategy you like, but jest works out of the box. Create test files in directories called `__tests__` to have the files loaded by jest. See the [the template project](https://github.com/react-community/create-react-native-app/tree/master/react-native-scripts/template/__tests__) for an example test. The [jest documentation](https://facebook.github.io/jest/docs/getting-started.html) is also a wonderful resource.

## Sharing & Deployment

Create React Native App does a lot of work to make app setup and development simple and straightforward, but it's very difficult to do the same for deploying to Apple's App Store or Google's Play Store without relying on a hosted service.

### Publishing to Exponent's React Native Community

Exponent provides free hosting for the JS-only apps created by CRNA, allowing you to share your app through the Exponent client app. This requires registration for an Exponent account.

TODO provide instructions

### Building an Exponent "standalone" app

You can also use a service like [Exponent's standalone builds](https://docs.getexponent.com/versions/latest/guides/building-standalone-apps.html) if you want to get an IPA/APK for distribution without having to build the native code yourself.

### Ejecting from Create React Native App

If you want to build and deploy your app yourself, you'll need to eject from CRNA and use Xcode and Android Studio.

This is usually as simple as running `npm run eject` in your project, which will walk you through the process. Make sure to install `react-native-cli` and follow the [native code getting started guide for React Native](https://facebook.github.io/react-native/docs/getting-started.html).

#### Should I Use ExponentKit?

If you have made use of Exponent APIs while working on your project (aside from `Exponent.registerRootComponent`), then those API calls will stop working if you eject to a regular React Native project. If you want to continue using those APIs, you can eject to "React Native + ExponentKit" which will still allow you to build your own native code and continue using the Exponent APIs. See the [ejecting guide](https://github.com/react-community/create-react-native-app/blob/master/EJECTING.md) for more details about this option.
