---
'@builder.io/sdk-vue': minor
---

- 🧨 Breaking: removed Vue 2 SDK

- 🧨 Breaking: removed `@builder.io/sdk-vue/vue3` import. To import the SDK, you should now use:

```ts
// BEFORE
import { Content } from '@builder.io/sdk-vue/vue3';

// AFTER
import { Content } from '@builder.io/sdk-vue';
```
