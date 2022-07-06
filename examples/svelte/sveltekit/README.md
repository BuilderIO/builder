# Builder.io example with Sveltekit

This example shows our [Svelte SDK](/packages/sdks/output/svelte) with Sveltekit.

## Builder.io Setup

- log into builder.io
- from your account page, copy your API key and paste it into BUILDER_API_KEY in `DynamicallyRenderBuilderPage.svelte`
- open the Builder.io Visual Editor for the model named "page"
- enter http://localhost:3000 in the URL bar to the top right of the preview in Builder
- drag a component into the layers tab, and it will appear in the Editor!

Checkout this Loom for a visual walkthrough: https://www.loom.com/share/afd7c9a1f8f148959ea0396be42560fd (it's originally intended for React-Native, but all of the steps are still the exact same)

## Status

For the status of the SDK, look at [these tables](/packages/sdks/README.md#feature-implementation).

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn run dev
# or start the server and open the app in a new browser tab
$ yarn run dev -- --open
```
