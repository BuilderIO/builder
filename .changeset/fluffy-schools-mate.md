---
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-vue': patch
---

Fix: Stringify inlined SSR A/B test scripts at build-time. Avoids mismatches caused by run-time stringification.
