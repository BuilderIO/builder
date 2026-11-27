---
'@builder.io/plugin-algolia': patch
'@builder.io/plugin-sfcc-sync': patch
'@builder.io/plugin-smartling': patch
---

Create webhooks without `disableProxy` so Builder fires them from the server instead of the browser, which lets their URL and headers be held server-side.
