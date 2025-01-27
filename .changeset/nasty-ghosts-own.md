---
'@builder.io/sdk-react': patch
---

Feat: exports `setClientUserAttributes` helper that can be used to set and update Builder's user attributes cookie. This cookie is used by Builder's Personalization Containers to decide which variant to render.

Usage example:

```ts
import { setClientUserAttributes } from '@builder.io/sdk-react';

setClientUserAttributes({
  device: 'tablet',
});
```
