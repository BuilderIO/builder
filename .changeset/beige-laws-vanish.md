---
'@builder.io/sdk-vue': patch
---

Fix CSS imports:

- add a `/nuxt` subpath export for a Nuxt module. Currently, it handles importing CSS, and is used like so:

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['@builder.io/sdk-vue/nuxt'],
});
```

- bring back `/css` subpath export. This is used internally by the Nuxt module, but also allows more flexibility for customers to import CSS as they see fit.
- remove CSS imports from server bundles, as they cause errors due to invalid extensions.
- add `sideEffects` array to package.json for webpack.
