## ⚠️ WARNING ⚠️: Do not publish packages manually

The SDKs are meant to be published using the `release-sdk` script, and never manually released. This is because the script does a few important things:

- Guarantees that all dependencies are properly built.
- Updates the `SDK_VERSION` constant in each SDK to match the version you are about to publish. The Visual Editor uses this constant to tell us which version of the SDK is being used on a given page. This helps our team a lot when debugging user issues.
- Guarantees that all SDKs are published with the exact same version number. This makes it much easier to communicate internally and externally about which SDK versions offer a certain feature (e.g. "v0.5.9 adds support for Nested Symbols", instead of "v0.4.3 on Qwik, v0.4.8 on Vue, v0.5.7 on NextJS").

PS: The one exception to the last point is publishing `dev` versions. You are free to publish these for just one SDK, as they are meant for testing/dev purposes.

# Steps

## 1- Setup

- Make sure you've run `yarn` in `packages/sdks/`.
- Make sure you are logged in to NPM via yarn, using `yarn npm login`. You will need to provide your one-time password every time you release each SDK.
- Make sure you have the permissions needed to publish all of the SDKs on `npm`.

## 2- Update `CHANGELOG.md`

Before publishing, make sure to update the `CHANGELOG.md` inside each folder in `packages/output/**`. If the changes only impact certain SDKs and not others, you should still update the `CHANGELOG.md` with the new version number and write "- No Changes" where needed. See previous `CHANGELOG.md` logs for examples.

## 3a- Publish `patch`, `minor` versions

When publishing `patch` or `minor` versions, you can use the following commands:

```bash
yarn release:all:patch
yarn release:all:minor
```

## 3b- Publish `dev` versions

```bash
# Release a dev version of all packages
yarn release:all:dev

# Release a dev version of a specific package
# replace `qwik` with the name of the SDK you want to release
yarn release-sdk qwik dev
```

## 4- Update examples

```
yarn upgrade-example:all
```

This will upgrade every example that uses the SDKs, so that they point to the new version you just released. This is very handy for keeping the examples in sync.
