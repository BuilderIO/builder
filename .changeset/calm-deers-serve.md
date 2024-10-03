---
'@builder.io/sdk-vue': patch
---

Feature: add `@builder.io/sdk-vue/node/init` entry point with `initializeNodeRuntime` export that sets the IVM instance.

In your Nuxt app, you can directly use it via the nuxt module shipped from the SDK.

```tsx
// nuxt.config.ts
export default defineNuxtConfig({
  // ...
  modules: [
    [
      '@builder.io/sdk-vue/nuxt',
      {
        includeCompiledCss: true, // adds the compiled Builder.io CSS in Nuxt (by default `true`)
        initializeNodeRuntime: true, // initializes isolated vm in node runtime (by default `false`)
      },
    ],
  ],
});
```
