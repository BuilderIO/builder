---
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Fix: improve NodeJS runtime performance by reusing the same IsolatedVM Isolate instance for all data bindings. Add the ability to provide arguments to configure the isolate in `initializeNodeRuntime` via an `ivmIsolateOptions` parameter.
