---
"@builder.io/sdk": major
"@builder.io/react": major
---

Permanently removes `apiEndpoint` prop from `builder.get()` and `builder.getAll()` which would have options `'content'` and `'query'`. Content API will be the default API endpoint is used for the content fetching.
