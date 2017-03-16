# Releasing Create React Native App

This document contains checklists to be done before releasing new versions.

**TODO**: This is not an exhaustive list. At the moment it contains easy-to-forget steps, so that they would not be forgotten.

## Verify .flowconfig is up to date after updating expo-sdk

After upgrading the [expo-sdk](https://github.com/exponent/exponent-sdk) version (which transitively updates the `react-native` version), ensure that the [.flowconfig](react-native-scripts/template/.flowconfig) template is up to date.

Easiest way to do this, is:
1. Use [this handy chart](VERSIONS.md) to find out the underlying `react-native` versions of the old and new `expo-sdk`.
2. Get `react-native` .flowconfig changeset in the React Native repo with `git diff tags/v0.41.0 tags/v0.42.0 -- local-cli/templates/HelloWorld/_flowconfig`
3. If there are changes, land diff to CRNA [.flowconfig](react-native-scripts/template/.flowconfig) template
4. To test, follow instructions in [README/Adding Flow](react-native-scripts/README.md#adding-flow) on a freshly generated project, and do `npm run flow` to ensure the process exits without error.
5. If there are new issues with third-party dependencies, fix them upstream or add necessary `[ignore]` fields to .flowconfig.
