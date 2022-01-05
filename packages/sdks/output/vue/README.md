# Builder.io Vue SDK

## Getting Started

```
npm install @builder.io/sdk-vue
```

## Usage with Nuxt

> Requires nuxt >= @2.15

Add to your `nuxt.config.js`:

```js
buildModules: ['@builder.io/sdk-vue/nuxt'];
```

Then register built in and custom components as seen [here](/examples/vue-nuxt/scripts/register-builder-components.js)

You can see a full example of using Builder.io + Nuxt [here](/examples/vue-nuxt)

## Status

This SDK is currently in beta

Left to implement:

- SSR (Nuxt currently can't find the custom components on the server, looking into)
- Stacking columns on breakpoints
- "View current draft" logic
- "+ add block" button when starting a page (for now just drag your first block to the "layers" tab)
- Symbols
- Server side a/b testing
- "animations" tab and "data" tab
