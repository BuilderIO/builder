---
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-vue': patch
---

Fix: update "/edge" and "/node" subpath exports to only point to their corresponding bundles. This guarantees that the browser bundle is never imported by mistake.
