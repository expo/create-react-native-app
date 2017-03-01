# Create React Native App

## Warning

Create React Native App is currently at an alpha/preview level of reliability. If you're interested in helping us move it towards a release, please check out [`help-wanted` issues](https://github.com/react-community/create-react-native-app/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)! In the meantime we'd love to get [feedback and bug reports](https://github.com/react-community/create-react-native-app/issues/new) if you do try it out.

---

Create React Native apps with no build configuration.

## tl;dr

```sh
$ npm install -g create-react-native-app

$ create-react-native-app my-app
$ cd my-app/
$ npm start
```

Install the [Exponent](https://getexponent.com) app on your iOS or Android phone, and use the QR code in the terminal to open your app. When you're ready to share your project with others (for example, by deploying to an app store), read the [Sharing & Deployment](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md#sharing-deployment) section of the User Guide.

Create React Native App allows you to work with all of the [Components and APIs](https://facebook.github.io/react-native/docs/getting-started.html) in React Native, as well as most of the [JavaScript APIs](https://docs.getexponent.com/versions/latest/sdk/index.html) that the Exponent App provides.

## Sections

* [Getting Started](#getting-started)
* [User Guide](#user-guide)
* [Philosophy](#philosophy)
* [Why Use This?](#why-use-this)
* [Limitations and Capabilities](#limitations-and-capabilities)
* [Support and Contact](#support-and-contact)
* [Contributing](#contributing)

## Getting Started

### Installation

Install it once globally:

```sh
$ npm install -g create-react-native-app
  # or
$ yarn global add create-react-native-app
```

**You'll need to have Node >= 6 on your machine. We strongly recommend using npm >= 3 or a recent version of yarn.**

### Creating an App

To create a new app, run:

```sh
$ create-react-native-app my-app
$ cd my-app
```

This will create a directory called `my-app` inside the current working directory. Inside `my-app`, this will generate the initial project structure and install all of its dependencies.

If you're familiar with React Native already, you won't find any `ios` or `android` directories in this project, just JavaScript. Once this installation is done, there are some commands you can run in the project directory:

#### `npm start`

Runs your app in development mode.

Open it in the [Exponent app](https://getexponent.com) on your phone to view it. It will reload if you save edits to your files, and you will see build errors and logs in the terminal.

#### `npm test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.

#### `npm run ios`

Like `npm start`, but also attempts to open your app in the iOS Simulator if you're on a Mac and have it installed.

#### `npm run android`

Like `npm start`, but also attempts to open your app on a connected Android device or emulator. Requires an installation of Android build tools (see [React Native docs](https://facebook.github.io/react-native/docs/getting-started.html) for detailed setup).

#### `npm run eject`

This will start the process of "ejecting" from Create React Native App's build scripts. You'll be asked a couple of questions about how you'd like to build your project.

**Warning:** Running eject is a permanent action (aside from whatever version control system you use). An ejected app will require you to have an [Xcode and/or Android Studio environment](https://facebook.github.io/react-native/docs/getting-started.html) set up.

## User Guide

Please refer to the [User Guide](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md) for more details about anything here.

## Philosophy

* **Minimal "Time to Hello World"**: Create React Native App should reduce the setup time it takes to try building a mobile app to the absolute minimum, ideally on par with React web development (especially as seen with [Create React App](https://github.com/facebookincubator/create-react-app)).
* **Develop on Your Device**: It should be easy to develop on a physical device when you want to test how your app feels and responds to inputs.
* **One Build Tool**: If you just want to get started with React Native, you shouldn't need to install Xcode, Android Studio, NDKs, or mess with environment variables.
* **No Lock-In**: You can always "eject" to your own build setup if you need to write custom native code or modify how your app is built.

## Limitations and Capabilities

The main limitation of a CRNA project is that it must be written in pure JavaScript and not have any dependencies which rely on custom native code (i.e. ones which require running `react-native link` to work). This allows the projects to load directly on a phone without native compilation, and also means that it's not necessary to install or use Android Studio or Xcode.

Apps made with Create React Native App support everything in the Components and APIs sections of the [React Native Documentation](https://facebook.github.io/react-native/docs/getting-started.html).

Apps made with Create React Native App also support most of the JavaScript-to-Native APIs provided by the [Exponent SDK](https://docs.getexponent.com/versions/latest/sdk/index.html), since they are loaded by the Exponent app.

If you're sure that you need custom native code, please read the [ejecting guide](https://github.com/react-community/create-react-native-app/blob/master/EJECTING.md).

If you need to build IPAs and APKs for publishing to the App Store and/or Play Store, you can either eject (see above guide) and build them yourself using Xcode and Android Studio, or you can use a service like [Exponent's standalone app builds](https://docs.getexponent.com/versions/v13.0.0/guides/building-standalone-apps.html) to publish your pure JS app.

## Support and Contact

If you're having issues with Create React Native App, please make sure:

* The issue is not covered in the [Getting Started](https://github.com/react-community/create-react-native-app#getting-started) or [User Guide](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md) documentation
* There is not already an [open issue](https://github.com/react-community/create-react-native-app/issues) for your particular problem

If you've checked the documentation and currently open issues, please either open a new GitHub issue, [find @dika10sune on Twitter](https://twitter.com/dika10sune), or ping `dikaiosune` on [Reactiflux](https://www.reactiflux.com/)'s #react-native channel on Discord. **Please do not DM or email project maintainers directly**, as it's very important that support takes place in public locations where others can benefit from the conversation.

## Contributing

Contributions will be licensed under the [3-clause BSD license](https://github.com/react-community/create-react-native-app/blob/master/LICENSE). Please fork the repository, perform your work on a feature branch, and submit a pull request to this repository's master branch from your fork's branch.

For details about setting up a development environment and testing your changes, please see [CONTRIBUTING.md](https://github.com/react-community/create-react-native-app/blob/master/CONTRIBUTING.md).
