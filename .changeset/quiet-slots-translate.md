---
'@builder.io/utils': patch
---

Stop sending Symbol slot content to Smartling twice. Slot blocks are now extracted once under their own block ids, and localized values in a nested Symbol's `children` slot are still extracted.
