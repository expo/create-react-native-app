## 2.0.1 (September 21, 2018)

This release merges Create React Native App with Expo CLI.

* **Expo CLI is a tool based on CRNA, made by the same team**
* **It has all the same features, plus some additional benefits**
* **Like CRNA, Expo CLI does not require an Expo user account**
* **The `create-react-native-app` command will continue to work**

The separate `react-native-scripts` package is now deprecated: new projects created with `create-react-native-app` will use Expo CLI instead of `react-native-scripts`. In addition to everything provided by CRNA, Expo CLI includes these extras:

* **Web-based user interface:** in addition to the CLI, there's a GUI where you can view logs, launch the app on your devices or simulators, and publish updates.
* **Standalone app builds:** you can build IPA and APK packages for deploying to App Store and Play Store without using Xcode or Android Studio.
* **Publishing:** you can push updates to your deployed apps and optionally publish your app to Expo.io.
* **Tunnel:** your physical device doesn’t need to be in the same wi-fi as your computer to be able to develop using it.
* **Optional user accounts:** logging in allows listing all your projects in development in the Expo app without having to scan any QR codes and enables additional features like standalone builds. However, just like CRNA, Expo CLI can also be used without a user account.

### Why are we bringing these two tools together?

* **Just one tool to learn:** previously developers would start with CRNA and then switch to exp or XDE for additional features like standalone builds. Expo CLI is as easy to get started with as CRNA, but also supports everything previously offered by these separate tools.
* **Less confusing options:** CRNA apps have always been loaded using the Expo app and able to use the Expo APIs in addition to the core React Native APIs. Users are sometimes confused about the differences between plain React Native, CRNA and Expo apps created with tools like exp or XDE. Installing the expo-cli package will make it clearer the additional functionality is provided by Expo.
* **Developer experience:** Expo CLI is ahead of CRNA in terms of features and developer experience, and we’re continuously improving it.
* **Maintenance:** having these two projects as separate codebases requires more maintenance and CRNA has previously falled behind because of this. A single codebase helps us keep it up to date and fix issues as fast as possible.

### Upgrading from 1.14.0 to 2.0.1

All apps created with `create-react-native-app`, are compatible with Expo CLI without changes.

Upgrade `react-native-scripts` to v2.0.1 with:
```
npm install --save --save-exact react-native-scripts@2.0.1
```
or
```
yarn add --exact react-native-scripts@2.0.1
```
When you run `npm start` for the first time, Expo CLI will be installed.

**Because `react-native-scripts` is now a wrapper for Expo CLI, you can also follow these steps to remove it from your project and use Expo CLI directly:**

1. Replace `react-native-scripts` with `expo` in the `scripts` config in `package.json`. Example:
    ```
    "scripts": {
      "start": "expo start",
      "eject": "expo eject",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "test": "jest"
    }
    ```
2. Remove `react-native-scripts` from `devDependencies`.

## 1.14.0 (April 27, 2018)

Update Expo SDK 27.

## 1.12.1 (March 29, 2018)

Update XDL to version 48.1.2.

## 1.12.0 (March 29, 2018)

* Add command to send the app URL to your phone via email or SMS.
* Add support for Yarn workspaces.
* Update XDL.

## 1.11.1 (January 26, 2018)

Update XDL to version 48.0.2.

## 1.10.0 (January 18, 2018)

Update to Expo SDK 25.

## 1.9.0 (January 17, 2018)

Update XDL to version 47.2.0.

## 1.8.0 (November 27, 2017)

Update for SDK 23.

## 1.7.0 (November 2, 2017)

Release notes for previous releases between 1.3.1 and 1.7.0 were not include here as they only included React Native version bumps.

#### Bug Fixes

* Fix Flow config, works on new projects now as expected.

## 1.3.1 (September 2, 2017)

#### Bug Fixes

* Fix an issue where `stdout` is null when validating inotify watches in some rare cases that I don't understand yet. (https://github.com/react-community/create-react-native-app/issues/234)

#### Committers

* brentvatne

## 1.3.0 (August 28, 2017)

#### Bug Fixes

* Force installation of Expo fork of react-native when ejecting to ExpoKit. (Fixes: https://forums.expo.io/t/exp-detach-build-failed-on-brand-new-create-react-native-app-eject/2610)

#### Committers

* brentvatne

## 1.2.1 (August 19, 2017)

#### Improvements

* Update to Expo SDK 20
* Warn if OS file watcher config is too low and watchman is not installed

#### Committers

* arahansen
* ro-savage
* vs1682
* brentvatne

## 1.1.0 (July 28, 2017)

#### Bug Fixes

* Switch Babel preset on eject ([#328](https://github.com/react-community/create-react-native-app/pull/328))
* Fix yarnpkg alias usage in the init script ([#329](https://github.com/react-community/create-react-native-app/pull/329))

#### Features

* Add interactive mode with keyboard commands ([#326](https://github.com/react-community/create-react-native-app/pull/326))
* Include whether dev or production is enabled in "Running app on" message ([655960](https://github.com/react-community/create-react-native-app/commit/655960090393673ec0a6208a1afac8f6821664e5))

#### Committers

* fson
* brentvatne

## 1.0 (July 24, 2017)

#### Bug Fixes

* Fix broken link in README to test example. ([532258](https://github.com/react-community/create-react-native-app/commit/5322584644413c1ea4ac70bbf1629a71803b27d5))
* Fix npm 5 version validation. ([#317](https://github.com/react-community/create-react-native-app/pull/317))

#### Features

* Add `--package-manager` option which allows you to specify any package manager to use when creating a project. ([#307](https://github.com/react-community/create-react-native-app/pull/307))
* Update to [Expo SDK 19](https://blog.expo.io/expo-sdk-v19-0-0-is-now-available-821a62b58d3d) / React Native 0.46.1.
* Update [xdl](https://github.com/expo/xdl)
  * Softens warnings for npm 5 where version > 5.0.3.
  * Removes the dependency on ngrok and dtrace, so there is no native compile step on install.
* Add CHANGELOG.md ([#319](https://github.com/react-community/create-react-native-app/pull/319))

#### Committers

* metheglin
* Hum4n01d
* DuncanMacWeb
* shashkovdanil
* brentvatne
