---
'@builder.io/sdk-react': patch
---

Fix: use `eval("require")` in favor of `node:module` when importing `isolated-vm` to avoid issues when bundling in Nextjs
