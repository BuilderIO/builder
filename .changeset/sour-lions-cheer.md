---
'@builder.io/sdk-react': patch
---

Fix: use eval("require") in favor of node:module import to avoid issues when bundling in Nextjs
