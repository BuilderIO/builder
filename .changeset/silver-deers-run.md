---
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-svelte': patch
---

Fix: dynamic import of `isolated-vm` to rely on `createRequire` instead of `eval("require")`
