# Versions

Apps built with Create React Native App rely on three project dependencies:

* `react-native` provides the core React Native functionality
* `react` is a peer dependency of `react-native`
* `expo` makes CRNA projects compatible with the Expo client app, and also provides access to several native APIs through JavaScript

The `app.json` file in a CRNA project also specifies `sdkVersion` which is necessary for the Expo client to provide the correct native API versions.

Each version of these dependencies is only compatible with a narrow version range of the other two. See the below table for the correct versions to use with each other:

| `react-native` | `react`         | `expo` | `sdkVersion` in app.json |
|----------------|-----------------|--------|--------------------------|
| 0.41.x         | 15.4.x          | 14.x.x | `"14.0.0"`               |
| 0.42.x         | 15.4.x          | 15.x.x | `"15.0.0"`               |
| 0.43.x         | 16.0.0-alpha.6  | 16.x.x | `"16.0.0"`               |
| 0.44.x         | 16.0.0-alpha.6  | 17.x.x | `"17.0.0"`               |
| 0.45.x         | 16.0.0-alpha.12 | 18.x.x | `"18.0.0"`               |
| 0.46.x         | 16.0.0-alpha.12 | 19.x.x | `"19.0.0"`               |
| 0.47.x         | 16.0.0-alpha.12 | 20.x.x | `"20.0.0"`               |
| 0.48.x         | 16.0.0-alpha.12 | 21.x.x | `"21.0.0"`               |
| 0.49.x         | 16.0.0-beta.5   | 22.x.x | `"22.0.0"`               |
| 0.50.x         | 16.0.0          | 23.x.x | `"23.0.0"`               |
