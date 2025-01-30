---
'@builder.io/sdk': patch
'@builder.io/react': patch
---

Fix: The value of `canTrack` that is set before `builder.init()` will ensure that `builderSessionId` is not saved
