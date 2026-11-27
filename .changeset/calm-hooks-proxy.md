---
'@builder.io/plugin-algolia': patch
'@builder.io/plugin-sfcc-sync': patch
'@builder.io/plugin-smartling': patch
---

Create webhooks without `disableProxy` and without a stored `Authorization` header. Builder fires them from the server and adds the space's plugin key itself, so the key is no longer saved on the model. Requires the Builder server change that adds the plugin key when firing these webhooks.
