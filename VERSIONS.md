# Versions

Apps created with Create React Native App rely on three project dependencies:

* `react-native` provides the core React Native functionality
* `react` is a peer dependency of `react-native`
* `expo` makes CRNA projects compatible with the Expo client app, and also provides access to several native APIs through JavaScript

The `app.json` file in a CRNA project also specifies `sdkVersion` which is necessary for the Expo client to provide the correct native API versions.

Each version of these dependencies is only compatible with a narrow version range of the other two. See [SDK version](https://docs.expo.io/versions/latest/sdk/#sdk-version) in the Expo docs for a list of Expo SDK versions and corresponding React Native versions.