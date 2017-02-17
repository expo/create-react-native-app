# Ejecting from Create React Native App

"Ejecting" is the process of setting up your own custom builds for your CRNA app. This process is not reversible, and will prevent your app from being properly runnable with the scripts CRNA provides.

If you see the reason you'd like to eject, click the link for a short explanation of the options:

* [I want to include a library which uses `react-native link`](#react-native-link)
* [I want to write my own native code for my app](#writing-my-own-native-code)
* [I want to build my app to publish to the App Store or Play Store](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md#sharing-deployment)
* [I am blocked from working on my app because of a bug in CRNA](#bugs-in-crna)

## General Information

Create React Native App makes it easy to start working on React Native apps by removing native code build tools from the equation. However, many apps want functionality that comes from interfacing directly with mobile platform APIs via Java, Objective-C, Swift, C, etc. As of right now, the only way to get direct access to these APIs from your app is by "ejecting" from CRNA and building the native code yourself.

You may also want to distribute your app to coworkers, friends, or customers (shocking!). Right now you can do so either by ejecting, or making use of a service to host or build your CRNA app. At the moment, Exponent is the only provider we're aware of that offers [hosting](https://docs.getexponent.com/versions/latest/guides/how-exponent-works.html#publishing-deploying-an-exponent-app-in-production) and [build services](https://docs.getexponent.com/versions/latest/guides/building-standalone-apps.html) for CRNA apps, but we'll definitely update this section as we become aware of others.

If you do need to eject to build your own distribution package or to include your own native code, there are two options at this time. To use either option, make sure to have the appropriate [Xcode and/or Android Studio environment](https://facebook.github.io/react-native/docs/getting-started.html) configured.

### Ejecting to Regular React Native

This will give you a project very similar to one created by `react-native init`. Make sure to install the `react-native-cli` tool:

```sh
npm i -g react-native-cli
# or
yarn global add react-native-cli
```

Also, please note that if you did make use of any Exponent APIs before ejecting, you'll need to remove or replace them. The CRNA template project currently comes with one usage of the Exponent API, for registering a root app component:

```js
import Exponent from 'exponent';
import {
  // modules...
} from 'react-native';

// ... your app goes here, probably with an App class

Exponent.registerRootComponent(App);
```

The eject process will attempt to rewrite this for you if possible, but if it needs to be done manually, it should look something like this:

```js
// no more Exponent line
import {
  // modules...
  AppRegistry,
} from 'react-native';

// ... your app goes here, probably with an App class

AppRegistry.registerComponent('MyAppName', () => App);
```

### Ejecting to ExponentKit

Using ExponentKit will allow you to continue using Exponent APIs along with building your own native code, but it requires an Exponent account and use of the Exponent developer tools.

Because this ejection process essentially produces a custom build of the Exponent client app, you don't need to modify any of your app's code, but you do still need to have an Xcode/Android Studio environment, along with `react-native-cli` and either [Exponent XDE](https://docs.getexponent.com/versions/latest/introduction/installation.html) or [`exp`](https://docs.getexponent.com/versions/latest/guides/exp-cli.html).

## Specific Motivations

### React Native Link

If you need to include a library which includes `react-native link` in its install instructions, there's a good chance you need to eject from CRNA. That said, there are JavaScript-only options available for a number of tasks, including some that are [built into the Exponent app](https://docs.getexponent.com/versions/latest/sdk/index.html) that CRNA uses to run your project.

TODO write a table of common needs in RN apps that can be done from JS

### Writing My Own Native Code

Developers are sometimes surprised at what can be accomplished with JS-only projects, which is also good for encouraging code reuse across platforms. That said, if you really need to write your own native code, then you'll need to eject.

### Bugs in CRNA

Sorry! We're working to fix any issues that arise from using CRNA to get started with your project.

Please let us know by commenting on an existing issue or by opening a new one if CRNA is blocking you from working on your app!
