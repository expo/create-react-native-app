# Ejecting from Create React Native App

"Ejecting" is the process of setting up your own custom builds for your CRNA app. It can be necessary to do if you have needs that aren't covered by CRNA, but please note that aside from the use of version control systems (git, hg, etc.) it is not reversible.

If you see the reason you'd like to eject, click the link for a short explanation of the options:

* [I want to include a library which uses `react-native link`](#react-native-link)
* [I want to write my own native code for my app](#writing-my-own-native-code)
* [I want to build my app to publish to the App Store or Play Store](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md#sharing-and-deployment)

## General Information

Create React Native App makes it easy to start working on React Native apps by removing native code build tools from the equation. However, many apps want functionality that comes from interfacing directly with mobile platform APIs via Java, Objective-C, Swift, C, etc. As of right now, the only way to get direct access to these APIs from your app is by "ejecting" from CRNA and building the native code yourself.

You may also want to distribute your app to coworkers, friends, or customers (shocking!). Right now you can do so by either making use of a service to host or build your CRNA app or by ejecting. At the moment, Expo is the only provider we're aware of that offers [hosting](https://docs.expo.io/versions/latest/guides/how-exponent-works.html#publishingdeploying-an-exponent-app-in-production) and [build services](https://docs.expo.io/versions/latest/guides/building-standalone-apps.html) for CRNA apps, but we'll definitely update this section as we become aware of others.

If you do need to eject to build your own distribution package or to include your own native code, there are two options at this time. To use either option, make sure to have the appropriate [Xcode and/or Android Studio environment](https://facebook.github.io/react-native/docs/getting-started.html) configured.

### Starting the Ejection Process

`npm run eject`

This will start the process of ejecting from Create React Native App's build scripts. You'll be asked a couple of questions about how you'd like to build your project. Once this command has successfully run, you should also follow any steps below that are applicable to your situation.

### Ejecting to Regular React Native

This will give you a project very similar to one created by `react-native init`. Make sure to install the `react-native-cli` tool:

```sh
npm i -g react-native-cli
# or
yarn global add react-native-cli
```

Also, please note that if you did make use of any Expo APIs before ejecting, you'll need to remove or replace them.

### Ejecting to ExpoKit

Using ExpoKit will allow you to continue using Expo APIs along with building your own native code, but it requires an Expo account and use of Expo developer tools.

Because this ejection process essentially produces a custom build of the Expo client app, you don't need to modify any of your app's code, but you do still need to have an Xcode/Android Studio environment, along with `react-native-cli` and either [Expo XDE](https://docs.expo.io/versions/latest/introduction/installation.html) or [`exp`](https://docs.expo.io/versions/latest/guides/exp-cli.html).

## Specific Motivations

### React Native Link

If you need to include a library which includes `react-native link` in its install instructions, there's a good chance you need to eject from CRNA. That said, there are JavaScript-only options available for a number of tasks, including some that are [built into the Expo app](https://docs.expo.io/versions/latest/sdk/index.html) that CRNA uses to run your project.

TODO write a table of common needs in RN apps that can be done from JS

### Writing My Own Native Code

Developers are sometimes surprised at what can be accomplished with JS-only projects, which is also good for encouraging code reuse across platforms. That said, if you really need to write your own native code, then you'll need to eject.
