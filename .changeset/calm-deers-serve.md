---
'@builder.io/sdk-vue': patch
---

Feature: add `@builder.io/sdk-vue/node/init` entry point with `initializeNodeRuntime` export that sets the IVM instance.

This import should be called in a server-only environment, such as:

- For using it manually in your Nuxt Pages, in `pages/[...app].vue` add:

  ```html
  <!-- pages/[...app].vue -->
  <script setup>
    // ...

    if (process.server || import.meta.server) {
      const { initializeNodeRuntime } = await import('@builder.io/sdk-vue/node/init');
      initializeNodeRuntime(); // initializes Isolated VM in the server
    }

    // fetch builder data after
  </script>
  ```

- Exported a new Nuxt plugin (`@builder.io/sdk-vue/nuxt-initialize-node-runtime-plugin`) that simplifies setting up the `isolated-vm` in Node.js environments. Here's how you can use it:

  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    // ...
    plugins: ['@builder.io/sdk-vue/nuxt-initialize-node-runtime-plugin'],
  });
  ```

- Updates to `@builder.io/sdk-vue/nuxt` Nuxt module which helps you achieve this in one place:

  - added `includeCompiledCss` flag that adds the compiled Builder.io CSS in Nuxt (defaults to `true`)
  - added `initializeNodeRuntime` flag that executes `nuxt-initialize-node-runtime-plugin` plugin (defaults to `false`)

  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    // ...
    modules: [
      [
        '@builder.io/sdk-vue/nuxt',
        {
          includeCompiledCss: true, // Includes Builder.io CSS (default: true)
          initializeNodeRuntime: true, // Initializes isolated VM in Node runtime (default: false)
        },
      ],
    ],
  });
  ```
