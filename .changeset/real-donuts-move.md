---
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-react': patch
---

Improve "./edge" subpath export to automatically use the browser bundle for browser environments. This allows the usage of that subpath export without also manually toggling with the "./browser" bundle.
