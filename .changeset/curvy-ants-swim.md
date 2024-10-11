---
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Various improvements to edge runtime interpreter:

- Correctly handle code blocks with async/await polyfills (typically `jsCode` blocks)
- Improve handling of getters and setters on `state` values
