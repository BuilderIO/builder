---
'@builder.io/sdk-angular': patch
---

Fix: hydration errors in angular ssr v17+ apps by skipping hydration from Content level for now as Angular doesn't support hydrating elements created dynamically
