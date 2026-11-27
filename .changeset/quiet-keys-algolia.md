---
'@builder.io/plugin-algolia': patch
---

Stop reading the Algolia key in the browser. The webhook URL and the one-time sync request no longer carry `algoliaKey`; Builder reads it from the space's plugin settings on the server. Requires the Builder `algolia-sync` change that resolves credentials from plugin settings.
