---
'@builder.io/sdk-vue': patch
---

Fix: add `/nuxt` and `/css` module exports:

- you can `import '@builder.io/sdk-vue/css'` in your Vue app to include the SDK's stylesheet:

```vue
<!-- App.vue -->
<script lang="ts">
import '@builder.io/sdk-vue/css';
import { RenderContent, _processContentResult } from '@builder.io/sdk-vue/vue2';

//...
</script>
```

- Alternatively, can add the `'@builder.io/sdk-vue/nuxt'` module in your nuxt config, which will automatically add the SDK's stylesheet:

```js
// nuxt.config.js
{
  buildModules: [
    '@builder.io/sdk-vue/nuxt',
  ],
}
```
