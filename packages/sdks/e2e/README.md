## General Info

- `packages/sdks-tests/src` contain the playwright tests, and the playwright config used for all e2e tests.
- all other packages at `packages/sdks/e2e/**` represent different servers that all consume the same `e2e/tests` specs.

## Setup

To run an e2e test, first choose which SDK you want to test, and which e2e server you will use (e.g. Svelte SDK using `e2e/svelte`).

Now, run commands to listen to changes for the SDK code:

- `yarn run start` at the root of the SDK project to run Mitosis' `build` command
- If applicable, the command that builds your SDK of choice (e.g. `yarn run build:watch` for Svelte SDK)

And finally, run commands to listen to changes for the e2e specs & server:

- `yarn run dev` in `packages/sdks/e2e/tests/src/specs` to listen to changes for the specs
- `yarn run dev` in your E2E server of choice.

If you don't want to listen to changes on the SDK itself, then you only need to run the first 2 commands once.

## Adding a test

- build a new piece of content using Builder that recreates the test
- download its JSON
- put its JSON in `packages/sdks/e2e/tests/src/specs`
- return it in the `getContentForPathname` function of https://github.com/BuilderIO/builder/blob/main/packages/sdks/e2e/tests/src/specs/index.ts, under the appropriate URL pathname
- add a test case for that pathname in `main.spec.ts` that checks for what you need
