# Releasing Create React Native App

This document contains checklists to be done before releasing new versions.

**WARNING**: Just don't release `create-react-native-app`. Just don't do it.

The rest of these instructions are for releasing `react-native-scripts`.

## Update Dependency Versions

This section only applies when bumping the Expo SDK and React Native versions.

* react-native
* react
* expo
* jest-expo
* react-test-renderer
* app.json:expo.sdkVersion

Also, update VERSIONS.md.

### Verify .flowconfig is up to date after updating expo-sdk

After upgrading the [expo-sdk](https://github.com/exponent/exponent-sdk) version (which transitively updates the `react-native` version), ensure that the [.flowconfig](react-native-scripts/template/.flowconfig) template is up to date.

Easiest way to do this, is:
1. Use [this handy chart](VERSIONS.md) to find out the underlying `react-native` versions of the old and new `expo-sdk`.
2. Get `react-native` .flowconfig changeset in the React Native repo with `git diff tags/v0.41.0 tags/v0.42.0 -- local-cli/templates/HelloWorld/_flowconfig`
3. If there are changes, land diff to CRNA [.flowconfig](react-native-scripts/template/.flowconfig) template
4. To test, follow instructions in [README/Adding Flow](react-native-scripts/README.md#adding-flow) on a freshly generated project, and do `npm run flow` to ensure the process exits without error.
5. If there are new issues with third-party dependencies, fix them upstream or add necessary `[ignore]` fields to .flowconfig.

## Clean, Build, Pack, Test, Publish

Run `yarn run build && npm pack` in the scripts package to get a tarball. Test this tarball with a clean yarn cache on Mac and Windows at a minimum. If everything checks out, run `yarn run publish` after bumping the version in package.json.
