# Builder.io example with Sveltekit

Builder.io drag-and-drop page and section building for Sveltekit!

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

## Builder.io Setup

- log into builder.io
- from your account page, copy your API key and paste it into BUILDER_API_KEY in `[slug].svelte` and `index.svelte`
- open the Builder.io Visual Editor for the model named "page"
- enter http://localhost:3000 in the URL bar to the top right of the preview in Builder
- drag a component into the layers tab, and it will appear in the Editor!

Checkout this Loom for a visual walkthrough: https://www.loom.com/share/afd7c9a1f8f148959ea0396be42560fd (it's originally intended for React-Native, but all of the steps are still the exact same)

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
