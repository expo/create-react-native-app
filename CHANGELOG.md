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
