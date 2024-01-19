# Develop

## Setup

- go to `packages/` and run `yarn`. This will install all dependencies for all packages in the mono-repo.

## Build an SDK

`yarn nx build @builder.io/sdk-svelte` (replace `svelte` with the SDK you want to build)

For Gen1 React SDK, that would be `yarn nx build @builder.io/react`.

## Integration Testing

The best way to test a change is to create a builder content JSON in the editor, download it, and add it as an integration test. But if you need to test some interaction with the Query API that is hard to check using JSON, you will need to symlink the SDK to an example project.

### Write tests

- go to the builder editor and create a content entry that showcases the feature/bug you want to test.
- download that content's JSON
- add it to `src/specs/index.ts` as a new test case (see other specs for examples)
- add a test case for it in `src/tests` (see other tests for examples)

This new test will run against every SDK & framework combination.

### Run tests

If you want to run the integration tests locally, you can do so by running (using `svelte` as an example):

- Build tests: `yarn e2e:build:svelte` in `builder/packages/sdks`
- Run Playwright tests: `yarn e2e:run:svelte` in `builder/packages/sdks`

PS: To run the tests against the gen1 React SDK, the commands are `e2e:build:old-react` and `e2e:run:old-react` in `builder/packages`.

### Debug tests

By adding the `--debug` flag (e.g. `yarn e2e:run:svelte --debug`), you can run the tests in a browser window with an interactive Playwright. This is useful for debugging.

When using the debug flag, it is recommended to add `.only` to the tests you want to debug, so that the others are temporarily ignored by playwright. See:

- https://playwright.dev/docs/api/class-test#test-describe-only
- https://playwright.dev/docs/api/class-test#test-only

### Run server without tests

If you want to run the integration server locally _without_ running any of the Playwright tests, you can do so by running:

- `yarn nx serve @e2e/sveltekit` (replace `@e2e/sveltekit` with the name of the server you want to run)

### Live/real data testing

You can fetch real data from the Builder API instead of using the JSON mock files. Go to your e2e server, find the `getProps` call, and add `data: "real"` as an argument.

## sym-linking the SDK to your own project

- `yarn nx build` in your SDK folder (e.g. `packages/sdks/output/svelte`, or `packages/react` for gen1 React SDK)
- `npm link` in your SDK folder
- `npm link @builder.io/sdk-svelte` in your project folder (e.g. `examples/sveltekit`)

To unlink the SDK from your project, all you have to do is run `npm install` in your project folder. That will clear all sym-links.

**NOTE: Testing React-Native SDK in iOS Simulator**

One big caveat is that the iOS Simulator does not support sym-linked packages. To workaround this, you will have to copy the SDK folder. This means that you will need to manually do so every time you want a new change to be reflected. in the react-native example, there is a handy `yarn run cp-sdk` command to do that for you.

## Mitosis

To simlink Mitosis, you need [jq](https://stedolan.github.io/jq/). You can install that with `brew install jq`.

All the above assumes you are using the latest version of Mitosis in production. If you need to use a local version with some not-yet-merged changes, here are the steps:

- Clone and setup https://github.com/BuilderIO/mitosis/ as a sibling to this repo: (e.g. `my-code/builder/` and `my-code/mitosis`)
- Follow its [setup steps](https://github.com/BuilderIO/mitosis/blob/main/developer.md)
- run the `yarn run start` commands in both `mitosis/packages/core` and `mitosis/packages/cli`
- Now, in this repo, run `yarn run add-symlinks`

You should now be using your local version of Mitosis.

### REMOVING SYM-LINKS

**IMPORTANT:** remember to run `yarn run remove-symlinks` before you commit to your branch. This applies to `project/sdks`, but also any example that you symlink the SDKs to (i.e. vue-storefront or react-native examples)
