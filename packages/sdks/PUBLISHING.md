## ⚠️ WARNING ⚠️: Do not publish packages manually

The SDKs are meant to be published using the Github Action, and never manually released. This is because the script does a few important things:

- Guarantees that all dependencies are properly built.
- Updates the `SDK_VERSION` constant in each SDK to match the version you are about to publish. The Visual Editor uses this constant to tell us which version of the SDK is being used on a given page. This helps our team a lot when debugging user issues.
- Guarantees that all SDKs are published with the exact same version number. This makes it much easier to communicate internally and externally about which SDK versions offer a certain feature (e.g. "v0.5.9 adds support for Nested Symbols", instead of "v0.4.3 on Qwik, v0.4.8 on Vue, v0.5.7 on NextJS").

PS: The one exception to the last point is publishing `dev` versions. You are free to publish these for just one SDK, as they are meant for testing/dev purposes.

# Steps

## 1- Update `CHANGELOG.md`

Before publishing, make sure to update the `CHANGELOG.md` inside each folder in `packages/output/**`. If the changes only impact certain SDKs and not others, you should still update the `CHANGELOG.md` with the new version number and write "- No Changes" where needed. See previous `CHANGELOG.md` logs for examples.

## 2- Bump package versions

## 2a- patch

When bumping `patch` or `minor` versions, you can use the following commands:

```bash
yarn version:all:patch
yarn version:all:minor
```

## 2b- `dev`

```bash
# bump a dev version of all packages
yarn version:all:dev

# bump a dev version of a specific package
# replace `qwik` with the name of the SDK you want to version
yarn version-sdks dev qwik
```

## 3- Merge PR

## 4- Publish

Run the Release SDKs Github Action workflow.

## 5- Update examples (optional)

```
yarn upgrade-example:all
```

This will upgrade every example that uses the SDKs, so that they point to the new version you just released. This is very handy for keeping the examples in sync.
