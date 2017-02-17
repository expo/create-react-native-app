# Versions

Apps built with Create React Native App rely on three project dependencies:

* `react-native` provides the core React Native functionality
* `react` is a peer dependency of `react-native`
* `exponent` makes CRNA projects compatible with the Exponent client app, and also provides access to several native APIs through JavaScript

The `app.json` file in a CRNA project also specifies `sdkVersion` which is necessary for the Exponent client to provide the correct native API versions.

Each version of these dependencies is only compatible with a narrow version range of the other two. See the below table for the correct versions to use with each other:

| `react-native` | `react` | `exponent` | `sdkVersion` in app.json |
|----------------|---------|------------|--------------------------|
| 0.41.x         | 15.4.x  | 14.x.x     | 14.0.0                   |
|                |         |            |                          |
|                |         |            |                          |
