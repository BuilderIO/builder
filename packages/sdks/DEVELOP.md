# Develop

## Setup

```bash
# install
yarn
```

You might need [jq](https://stedolan.github.io/jq/) for symlinking mitosis or the SDKs themselves to examples. You can install that with `brew install jq`.

## Build an SDK

- You need to run these scripts to build everything: https://github.com/BuilderIO/builder/blob/62dc353fbe6873984133b774d7862beeb68b3d6b/.github/workflows/ci.yml#L140-L151

```
      - name: Build Core
        run: yarn workspace @builder.io/sdk ci:build

      - name: Build SDK
        run: yarn workspace @builder.io/react build

      - name: Build Mitosis
        run: yarn build:mitosis

      - name: Build SDK
        run: yarn workspace @builder.io/sdk-${{ matrix.sdk }} build
```

- replace `${{ matrix.sdk }}` with whichever SDK you want to test: qwik, vue, react, etc. Let’s say you picked `svelte`

## Test an SDK

The best way to test a change is to create a builder content JSON in the editor, download it, and add it as an integration test. But if you need to test some interaction with the Query API that is hard to check using JSON, you will need to symlink the SDK to an example project.

### Integration testing

- go to the builder editor and create a content entry that showcases the feature/bug you want to test.
- download that content's JSON
- add it to `src/specs/index.ts` as a new test case (see other specs for examples)
- add a test case for it in `src/tests` (see other tests for examples)

This new test will run against every SDK & framework combination.

If you want to manually test this integration test, you will have to (using `svelte` as an example):

- run `yarn run start` in `builder/packages/sdks` to run Mitosis' `build` command in watch mode
- run `yarn run build --watch` in `builder/packages/sdks/output/svelte` to build the SDK in watch mode
- run `yarn run dev` in `builder/packages/sdks-tests` to build the e2e tests in watch mode
- run `yarn run dev` in `builder/packages/sdks/e2e/sveltekit`

You can then test your changes in the sveltekit e2e example.

### Manual testing

Using `svelte` as an example, once you've built the SDK as per the previous steps:

- go to `output/svelte` and run `npm link`.
- go to an example in our monorepo that uses it, say `builder/examples/svelte/sveltekit`, and
  - `npm install`
  - `npm link @builder.io/sdk-svelte`
  - `npm run dev` and test your change

#### NOTE: Testing React-Native SDK in iOS Simulator

One big caveat is that the iOS Simulator does not support sym-linked packages. To workaround this, you will have to copy the SDK folder. This means that you will need to manually do so every time you want a new change to be reflected. in the react-native example, there is a handy `yarn run cp-sdk` command to do that for you.

## Mitosis

All the above assumes you are using the latest version of Mitosis in production. If you need to use a local version with some not-yet-merged changes, here are the steps:

- Clone and setup https://github.com/BuilderIO/mitosis/ as a sibling to this repo: (e.g. `my-code/builder/` and `my-code/mitosis`)
- Follow its [setup steps](https://github.com/BuilderIO/mitosis/blob/main/developer.md)
- run the `yarn run start` commands in both `mitosis/packages/core` and `mitosis/packages/cli`
- Now, in this repo, run `yarn run add-symlinks`

You should now be using your local version of Mitosis.

## REMOVING SYM-LINKS

**IMPORTANT:** remember to run `yarn run remove-symlinks` before you commit to your branch. This applies to `project/sdks`, but also any example that you symlink the SDKs to (i.e. vue-storefront or react-native examples)
