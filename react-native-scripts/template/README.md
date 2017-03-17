This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

Below you'll find information about performing common tasks. The most recent version of this guide is available [here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).

## Table of Contents

* [Updating to New Releases](#updating-to-new-releases)
* [Available Scripts](#available-scripts)
  * [npm start](#npm-start)
  * [npm test](#npm-test)
  * [npm run ios](#npm-run-ios)
  * [npm run android](#npm-run-android)
  * [npm run eject](#npm-run-eject)
* [Writing and Running Tests](#writing-and-running-tests)
* [Adding Flow](#adding-flow)
* [Customizing App Display Name and Icon](#customizing-app-display-name-and-icon)
* [Sharing and Deployment](#sharing-and-deployment)
  * [Publishing to Expo's React Native Community](#publishing-to-expos-react-native-community)
  * [Building an Expo "standalone" app](#building-an-expo-standalone-app)
  * [Ejecting from Create React Native App](#ejecting-from-create-react-native-app)
    * [Build Dependencies (Xcode & Android Studio)](#build-dependencies-xcode-android-studio)
    * [Should I Use ExpoKit?](#should-i-use-expokit)
* [Troubleshooting](#troubleshooting)

## Updating to New Releases

You should only need to update the global installation of `create-react-native-app` very rarely, ideally never.

Updating the `react-native-scripts` dependency of your app should be as simple as bumping the version number in `package.json` and reinstalling your project's dependencies.

Upgrading to a new version of React Native requires updating the `react-native`, `react`, and `expo` package versions, and setting the correct `sdkVersion` in `app.json`. See the [versioning guide](https://github.com/react-community/create-react-native-app/blob/master/VERSIONS.md) for up-to-date information about package version compatibility.

## Available Scripts

If Yarn was installed when the project was initialized, then dependencies will have been installed via Yarn, and you should probably use it to run these commands as well. Unlike dependency installation, command running syntax is identical for Yarn and NPM at the time of this writing.

### `npm start`

Runs your app in development mode.

Open it in the [Expo app](https://expo.io) on your phone to view it. It will reload if you save edits to your files, and you will see build errors and logs in the terminal.

#### `npm test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.

#### `npm run ios`

Like `npm start`, but also attempts to open your app in the iOS Simulator if you're on a Mac and have it installed.

#### `npm run android`

Like `npm start`, but also attempts to open your app on a connected Android device or emulator. Requires an installation of Android build tools (see [React Native docs](https://facebook.github.io/react-native/docs/getting-started.html) for detailed setup).

#### `npm run eject`

This will start the process of "ejecting" from Create React Native App's build scripts. You'll be asked a couple of questions about how you'd like to build your project.

**Warning:** Running eject is a permanent action (aside from whatever version control system you use). An ejected app will require you to have an [Xcode and/or Android Studio environment](https://facebook.github.io/react-native/docs/getting-started.html) set up.

## Customizing App Display Name and Icon

You can edit `app.json` to include [configuration keys](https://docs.expo.io/versions/latest/guides/configuration.html) under the `expo` key.

To change your app's display name, set the `expo.name` key in `app.json` to an appropriate string.

To set an app icon, set the `expo.icon` key in `app.json` to be either a local path or a URL. It's recommended that you use a 512x512 png file with transparency.

## Writing and Running Tests

This project is set up to use [jest](https://facebook.github.io/jest/) for tests. You can configure whatever testing strategy you like, but jest works out of the box. Create test files in directories called `__tests__` to have the files loaded by jest. See the [the template project](https://github.com/react-community/create-react-native-app/tree/master/react-native-scripts/template/__tests__) for an example test. The [jest documentation](https://facebook.github.io/jest/docs/getting-started.html) is also a wonderful resource, as is the [React Native testing tutorial](https://facebook.github.io/jest/docs/tutorial-react-native.html).

## Adding Flow

Flow is a static type checker that helps you write code with fewer bugs. Check out this [introduction to using static types in JavaScript](https://medium.com/@preethikasireddy/why-use-static-types-in-javascript-part-1-8382da1e0adb) if you are new to this concept.

React Native works with [Flow](http://flowtype.org/) out of the box, as long as your Flow version matches the one used in the version of React Native.

To add a local dependency to the correct Flow version to a Create React Native App project, follow these steps:

1. Find the Flow `[version]` at the bottom of the included [.flowconfig](.flowconfig)
2. Run `npm install --save-dev flow-bin@x.y.z` (or `yarn add --dev flow-bin@x.y.z`), where `x.y.z` is the .flowconfig version number.
3. Add `"flow": "flow"` to the `scripts` section of your `package.json`.
4. Add `// @flow` to any files you want to type check (for example, to `App.js`).

Now you can run `npm run flow` (or `yarn flow`) to check the files for type errors.
You can optionally use a plugin for your IDE for a better integrated experience.

To learn more about Flow, check out [its documentation](https://flowtype.org/).

## Sharing and Deployment

Create React Native App does a lot of work to make app setup and development simple and straightforward, but it's very difficult to do the same for deploying to Apple's App Store or Google's Play Store without relying on a hosted service.

### Publishing to Expo's React Native Community

Expo provides free hosting for the JS-only apps created by CRNA, allowing you to share your app through the Expo client app. This requires registration for an Expo account.

Install the `exp` command-line tool, and run the publish command:

```
$ npm i -g exp
$ exp publish
```

### Building an Expo "standalone" app

You can also use a service like [Expo's standalone builds](https://docs.expo.io/versions/latest/guides/building-standalone-apps.html) if you want to get an IPA/APK for distribution without having to build the native code yourself.

### Ejecting from Create React Native App

If you want to build and deploy your app yourself, you'll need to eject from CRNA and use Xcode and Android Studio.

This is usually as simple as running `npm run eject` in your project, which will walk you through the process. Make sure to install `react-native-cli` and follow the [native code getting started guide for React Native](https://facebook.github.io/react-native/docs/getting-started.html).

#### Should I Use ExpoKit?

If you have made use of Expo APIs while working on your project, then those API calls will stop working if you eject to a regular React Native project. If you want to continue using those APIs, you can eject to "React Native + ExpoKit" which will still allow you to build your own native code and continue using the Expo APIs. See the [ejecting guide](https://github.com/react-community/create-react-native-app/blob/master/EJECTING.md) for more details about this option.

## Troubleshooting

### Networking

If you're unable to load your app on your phone due to a network timeout or a refused connection, a good first step is to verify that your phone and computer are on the same network and that they can reach each other. Try opening a web browser on your phone and opening the URL that the packager script prints, replacing `exp://` with `http://`. So, for example, if underneath the QR code in your terminal you see:

```
exp://192.168.0.1:19000
```

Try opening Safari or Chrome on your phone and loading

```
http://192.168.0.1:19000
```

If this works, but you're still unable to load your app by scanning the QR code, please open an issue on the [Create React Native App repository](https://github.com/react-community/create-react-native-app) with details about these steps and any other error messages you may have received.

If you're not able to load the `http` URL in your phone's web browser, try using the tethering/mobile hotspot feature on your phone (beware of data usage, though), connecting your computer to that WiFi network, and restarting the packager.
