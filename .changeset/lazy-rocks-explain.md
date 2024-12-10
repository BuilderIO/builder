---
'@builder.io/sdk': major
'@builder.io/react': major
---

- Adds `apiEndpoint` prop to `builder` instance with permitted values being `'content'` or `'query'`. It dictates which API endpoint is used for fetching Builder content
- Breaking Change 🧨: Removes `apiEndpoint` argument from `builder.get()`, `builder.getAll()`, and the `options` prop of `<BuilderContent>` component. NOTE: this argument was not working as expected.
