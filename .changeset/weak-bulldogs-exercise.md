---
'@builder.io/sdk': patch
'@builder.io/react': patch
---

Adds `apiEndpoint` prop to `builder.get()` and `builder.getAll()` with options `'content'` and `'query'`. It dictates which API endpoint is used for the content fetching.
Defaults to `'query'`
