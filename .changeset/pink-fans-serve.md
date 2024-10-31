---
"@builder.io/sdk": major
"@builder.io/react": major
---

Permanently removes the `apiEndpoint` prop from `builder.get()` and `builder.getAll()` which had options `'content'` and `'query'`. Content API is now the only possible API endpoint for content fetching.
