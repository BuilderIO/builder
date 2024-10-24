---
'@builder.io/sdk-react': patch
---

Feature: add `/node/setIvm` export path. It provides a `setIvm` function that can be used to provide the SDK with an instance of the `isolated-vm` module. This is needed in Node.js environments for data bindings to work when `/node/init` can't be used.
