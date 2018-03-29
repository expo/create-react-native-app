# READ THIS FIRST, PLEASE!

The App Store version of the Expo iOS client recently had to remove the QR code scanner from the app. If you intend to load your app on a physical iOS device, please install the latest version of react-native-scripts to your app (`yarn add react-native-scripts@1.12.0`). It adds the "s" key to the interactive prompt, which asks you to enter an email address or phone number and then sends the URL to your device.

Read more at https://blog.expo.io/upcoming-limitations-to-ios-expo-client-8076d01aee1a. We apologize for any inconvenience this may cause you!

# Required format for issues

Please make our job easier by filling this template out to completion. If you're requesting a feature instead of reporting a bug, please feel free to skip the Environment and Reproducible Demo sections.

## Description

1-2 sentences describing the problem you're having or the feature you'd like to request

## Expected Behavior

What action did you perform, and what did you expect to happen?

## Observed Behavior

What actually happened when you performed the above actions?

If there's an error message, please paste the *full terminal output and error message* in this code block:

```
Error text goes here!
```

## Environment

Please run these commands in the project folder and fill in their results:

* `npm ls react-native-scripts`:
* `npm ls react-native`:
* `npm ls expo`:
* `node -v`:
* `npm -v`:
* `yarn --version`:
* `watchman version`:

Also specify:

1. Operating system:
2. Phone/emulator/simulator & version:

## Reproducible Demo

Please provide a minimized reproducible demonstration of the problem you're reporting.

Issues that come with minimal repro's are resolved much more quickly than issues where a maintainer has to reproduce themselves.
