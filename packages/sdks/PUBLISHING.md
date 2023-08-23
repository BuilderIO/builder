# Publishing

## ⚠️ WARNING ⚠️: Do not publish packages manually

The `builder.io` SDKs are meant to be published using the `release-sdk` script, and should not be manually released. This is because the script does a few things:

- Guarantees that all dependencies are properly built.
- Updates the `SDK_VERSION` constant in each SDK to the version number that is about to be published. The Visual Editor uses this constant to tell us which version of the SDK is being used in a given page. This helps our team a lot when debugging user issues.
- Guarantees that all `builder.io` SDKs are published with the same version number. This makes it much easier to communicate interally and externally about which SDK versions offer a certain feature (e.g. "v0.5.9 adds support for Nested Symbols").

PS: the one exception to the last point is publishing `dev` versions, which are allowed to have different version numbers.

## Steps

## 1- Setup

- Make sure you've run `yarn` in `packages/sdks/`.
- Make sure you are logged in to NPM via yarn, using `yarn npm login`.
- Make sure you have the permissions needed to publish all of the SDKs on `npm`.

### 2- Update `CHANGELOG.md`

Before publishing, make sure to update the `CHANGELOG.md` inside each folder in `packages/output/**`. If the new version only impacts certain SDKs and not others, you should still update the `CHANGELOG.md` with the new version number and write "- No Changes" where needed.

### Publish `patch`, `minor` versions

When publishing `patch` or `minor` versions, you can use the following commands:

```bash
yarn release:all:patch
yarn release:all:minor
```

### Publish `dev` versions

```bash
# Release a dev version of all packages
yarn release:all:dev

# Release a dev version of a specific package
# replace `qwik` with the name of the SDK you want to release
yarn release-sdk qwik dev
```
