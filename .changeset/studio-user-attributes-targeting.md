---
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-angular': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-vue': patch
---

Fix Variant Containers ignoring Builder Studio targeting overrides, which are passed as `builder.userAttributes.*` query params rather than through the cookie.
