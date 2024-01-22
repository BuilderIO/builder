# Builder.io example with Vue + Nuxt 3

This example shows our [Vue SDK](/packages/sdks/output/vue) with Vue 3 + Nuxt 3.

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more about Nuxt 3.

## Status

For the status of the SDK, look at [these tables](/packages/sdks/README.md#feature-implementation).

## Builder.io Setup

- log into builder.io
- from your account page, copy your API key and paste it into `BUILDER_PUBLIC_API_KEY` in [app.vue](./app.vue)
- open the Builder.io Visual Editor for the model named "page"
- enter http://localhost:3000 in the URL bar to the top right of the preview in Builder
- drag a component into the layers tab, and it will appear in the Editor!

Checkout this Loom for a visual walkthrough: https://www.loom.com/share/afd7c9a1f8f148959ea0396be42560fd (it's originally intended for React-Native, but all of the steps are still the exact same)

## Nuxt v3 Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

and add the SDK's Nuxt module in `nuxt.config.js`:

```js
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  module: ['@builder.io/sdk-vue/nuxt'],
});
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
