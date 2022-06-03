# Builder.io Vue 2.0 SDK (BETA)

This is the 2.0 Vue SDK. It is currently in beta.

NOTE: If you are looking for the stable 1.0 Vue SDK, you can find it [here](/packages/vue)

## Feature Support

To check the status of the SDK, look at [these tables](../../README.md#feature-implementation).

## Version Support

Legend:

- ✅: implemented
- 🏗: currently in progress
- ⚠️: not-yet implemented
- N/A : does not apply

| Platform | Support |
| -------- | ------- |
| Vue 2    | 🏗       |
| Nuxt 2   | 🏗       |
| Vue 3    | ⚠️      |
| Nuxt 3   | ⚠️      |

## Getting Started

```
npm install @builder.io/sdk-vue@dev
```

## Usage with Nuxt

> Requires nuxt >= @2.15

Add to your `nuxt.config.js`:

```js
buildModules: ['@builder.io/sdk-vue/nuxt'];
```

Then register built in and custom components as seen [here](/examples/vue/nuxt-2/scripts/register-builder-components.js)

You can see examples of using Builder.io:

- with Nuxt [here](/examples/vue/nuxt-2/)
- with Vue Storefront [here](/examples/vue/vue-storefront-2)
