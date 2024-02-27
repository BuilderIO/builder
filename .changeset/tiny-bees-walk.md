---
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Feature: allow passing `search` param (of type `URLSearchParams | string | object`) to `isPreviewing` and `isEditing` helpers. This allows users to rely on this function in SSR environments to determine whether the current request is a preview or edit request.
