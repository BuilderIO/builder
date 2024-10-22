# Publishing SDKs

### ⚠️ WARNING ⚠️: Do not publish packages manually

The SDKs are meant to be published using the Changeset+Github Action workflow, and never manually released. That is because the workflow:

- Ensures CHANGELOGs are properly updated for each SDK.
- Guarantees that all dependencies are properly built.
- Updates the `SDK_VERSION` constant in each SDK to match the version you are about to publish. The Visual Editor uses this constant to tell us which version of the SDK is being used on a given page. This helps our team a lot when debugging user issues.
- Guarantees that all SDKs are published in sync. This makes it much easier to communicate internally and externally about which SDK versions offer a certain feature (e.g. "`v0.5.9` adds support for Nested Symbols", instead of "`v0.4.3` on Qwik, `v0.4.8` on Vue, `v0.5.7` on NextJS").

### Note: Publishing `dev` versions

When testing something, you are free to publish `dev` versions for just one SDK and skip everything mentioned here. Go to the SDK folder of your choice and:

- `yarn version prerelease` to bump the version to the next prerelease (e.g. `0.5.9-1`)
- `yarn g:nx release  --tag=dev` to build and release the SDK

# Steps

## 1- Add Changeset

in your PR, run the following command from anywhere in the mono-repo:

```bash
yarn g:changeset
```

Follow the CLI instructions to create a changeset.

**NOTE:** If your changes do not impact all SDKs, you will need to run `yarn g:changeset add --empty` afterwards to create another empty changeset for each SDK that was not impacted.

## 2- Bump package versions & Release

Once you merge your PR changes, a workflow will automaically create a PR for you with the version bump. Once this PR is merged, the SDKs will be published to NPM.

If you need to do this manually:

- bump the versions:

```bash
yarn g:changeset version
```

- release the packages:

```bash
yarn g:nx ci:release
```

## 5- Update examples (optional)

```
yarn upgrade-example:all
```

This will upgrade every example that uses the SDKs, so that they point to the new version you just released. This is very handy for keeping the examples in sync.
