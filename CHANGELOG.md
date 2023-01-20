# Changelog

## Unpublished

### 🐛 Bug fixes

- Skip creating a git repo when inside existing repo ([#920](https://github.com/expo/create-react-native-app/pull/920) by [@byCedric](https://github.com/byCedric))

## 3.0.0 - 2020-04-16

Create React Native App is revived as a bare-bones npx package that can be used to start an opinionated bare-workflow universal React Native project.

## 2.0.1 - 2018-09-21

This release merges Create React Native App with Expo CLI.

- **Expo CLI is a tool based on CRNA, made by the same team**
- **It has all the same features, plus some additional benefits**
- **Like CRNA, Expo CLI does not require an Expo user account**
- **The `create-react-native-app` command will continue to work**

The separate `react-native-scripts` package is now deprecated: new projects created with `create-react-native-app` will use Expo CLI instead of `react-native-scripts`. In addition to everything provided by CRNA, Expo CLI includes these extras:

- **Web-based user interface:** in addition to the CLI, there's a GUI where you can view logs, launch the app on your devices or simulators, and publish updates.
- **Standalone app builds:** you can build IPA and APK packages for deploying to App Store and Play Store without using Xcode or Android Studio.
- **Publishing:** you can push updates to your deployed apps and optionally publish your app to Expo.io.
- **Tunnel:** your physical device doesn’t need to be in the same wi-fi as your computer to be able to develop using it.
- **Optional user accounts:** logging in allows listing all your projects in development in the Expo app without having to scan any QR codes and enables additional features like standalone builds. However, just like CRNA, Expo CLI can also be used without a user account.

### Why are we bringing these two tools together?

- **Just one tool to learn:** previously developers would start with CRNA and then switch to exp or XDE for additional features like standalone builds. Expo CLI is as easy to get started with as CRNA, but also supports everything previously offered by these separate tools.
- **Less confusing options:** CRNA apps have always been loaded using the Expo app and able to use the Expo APIs in addition to the core React Native APIs. Users are sometimes confused about the differences between plain React Native, CRNA and Expo apps created with tools like exp or XDE. Installing the expo-cli package will make it clearer the additional functionality is provided by Expo.
- **Developer experience:** Expo CLI is ahead of CRNA in terms of features and developer experience, and we’re continuously improving it.
- **Maintenance:** having these two projects as separate codebases requires more maintenance and CRNA has previously falled behind because of this. A single codebase helps us keep it up to date and fix issues as fast as possible.

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

## 1.14.0 - 2018-04-27

Update Expo SDK 27.

## 1.12.1 - 2018-03-20

Update XDL to version 48.1.2.

## 1.12.0 2018-03-29

### 🎉 New features

- Add command to send the app URL to your phone via email or SMS. ([2131997](https://github.com/expo/create-react-native-app/commit/2131997b4502e87234861699577590c40c64f726) by [@brentvatne](https://github.com/brentvatne))
- Add support for Yarn workspaces. ([#503](https://github.com/expo/create-react-native-app/pull/503) by [@connectdotz](https://github.com/connectdotz))
- Update XDL.

## 1.11.1 - 2018-01-26

### 🎉 New features

Update XDL to version 48.0.2. ([c671c7a](https://github.com/expo/create-react-native-app/commit/c671c7aeed8a3d62098e6fd1cbe05e8e4160d22a) by [@fson](https://github.com/fson))

## 1.10.0 - 2018-01-18

### 🎉 New features

- Update to Expo SDK 25. ([4139951](https://github.com/expo/create-react-native-app/commit/4139951f7422e58e95b75e730f30aa7a7db0a542) by [@brentvatne](https://github.com/brentvatne))

## 1.9.0 - 2018-01-17

### 🎉 New features

- Update XDL to version 47.2.0. ([70f61b5](https://github.com/expo/create-react-native-app/commit/70f61b578f9441320b3917416251a746e7ed601f) by [@fson](https://github.com/fson))

## 1.8.0 - 2017-11-27

### 🎉 New features

- Update for SDK 23. ([56df72a](https://github.com/expo/create-react-native-app/commit/56df72a4b862e42bcc0f172ad10c7f5639045006) by [@brentvatne](https://github.com/brentvatne))

## 1.7.0 - 2017-11-02

_Release notes for previous releases between 1.3.1 and 1.7.0 were not include here as they only included React Native version bumps._

### 🐛 Bug fixes

- Fix Flow config, works on new projects now as expected. ([7402574](https://github.com/expo/create-react-native-app/commit/7402574e8be1474453e568ab467abc4501c9b3e2) by [@brentvatne](https://github.com/brentvatne))

## 1.3.1 - 2017-09-02

### 🐛 Bug fixes

- Fix an issue where `stdout` is null when validating inotify watches in some rare cases that I don't understand yet. ([ed4f5f4](https://github.com/expo/create-react-native-app/commit/ed4f5f4d1e1464a782eb65ca1b7a5d26f3998c91) by [@brentvatne](https://github.com/brentvatne))

## 1.3.0 - 2017-08-28

### 🐛 Bug fixes

- Force installation of Expo fork of react-native when ejecting to ExpoKit. ([cbf3f9e](https://github.com/expo/create-react-native-app/commit/cbf3f9e373d2edde00c824d2269f26f6bf5b7cfb) by [@brentvatne](https://github.com/brentvatne))

## 1.2.1 - 2017-08-19

### 🐛 Bug fixes

- Update to Expo SDK 20. ([#370](https://github.com/expo/create-react-native-app/pull/370) by [@ro-savage](https://github.com/ro-savage))
- Fix syntax error in flowconfig template. ([#373](https://github.com/expo/create-react-native-app/pull/373) by [@arahansen](https://github.com/arahansen))
- Warn if OS file watcher config is too low and watchman is not installed. ([#358](https://github.com/expo/create-react-native-app/pull/358) by [@vs1682](https://github.com/vs1682))
- Check if watchman exists before existing due to os config. ([cd887b4](https://github.com/expo/create-react-native-app/commit/cd887b4bd0c671cf396082e2f5d043a9a99808a7) by [@brentvatne](https://github.com/brentvatne))

## 1.1.0 - 2017-07-28

### 🐛 Bug fixes

- Switch Babel preset on eject ([#328](https://github.com/expo/create-react-native-app/pull/328) by [@fson](https://github.com/fson))
- Fix yarnpkg alias usage in the init script ([#329](https://github.com/expo/create-react-native-app/pull/329) by [@fson](https://github.com/fson))

### 🎉 New features

- Add interactive mode with keyboard commands ([#326](https://github.com/expo/create-react-native-app/pull/326) by [@fson](https://github.com/fson))
- Include whether dev or production is enabled in "Running app on" message ([6559600](https://github.com/expo/create-react-native-app/commit/655960090393673ec0a6208a1afac8f6821664e5) by [@brentvatne](https://github.com/brentvatne))

## 1.0.0 - 2017-07-24

### 🐛 Bug fixes

- Fix broken link in README to test example. ([5322584](https://github.com/expo/create-react-native-app/commit/5322584644413c1ea4ac70bbf1629a71803b27d5) by [@brentvatne](https://github.com/brentvatne))
- Fix npm 5 version validation. ([#317](https://github.com/expo/create-react-native-app/pull/317) by [@DuncanMacWeb](https://github.com/DuncanMacWeb))

### 🎉 New features

- Add `--package-manager` option which allows you to specify any package manager to use when creating a project. ([#307](https://github.com/expo/create-react-native-app/pull/307) by [@metheglin](https://github.com/metheglin))
- Update to [Expo SDK 19](https://blog.expo.io/expo-sdk-v19-0-0-is-now-available-821a62b58d3d) / React Native 0.46.1. ([63d1ddb](https://github.com/expo/create-react-native-app/commit/63d1ddbc1237a64d0189b5390f34ac6ada8254c4) by [@brentvatne](https://github.com/brentvatne))
- Softens warnings for npm 5 where version > 5.0.3. ([#317](https://github.com/expo/create-react-native-app/pull/317) by [@DuncanMacWeb](https://github.com/DuncanMacWeb))
- Add CHANGELOG.md ([#319](https://github.com/expo/create-react-native-app/pull/319) by [@shashkovdanil](https://github.com/shashkovdanil))
- Update [xdl](https://github.com/expo/xdl)
  - Removes the dependency on ngrok and dtrace, so there is no native compile step on install.
