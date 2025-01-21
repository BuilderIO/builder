---
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Feat: exports `setClientUserAttributes` helper that can be used to set and update builder user attributes cookie

Usage example,

```ts
import { setClientUserAttributes } from '@builder.io/sdk-*';

setClientUserAttributes({
  device: 'tablet',
});
```
