---
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-vue': patch
---

Added a `trustedHosts` prop to `Content`. It is used to determine whether the SDK can enable editing/previewing mode within a host. Also added stricter default checking of trusted hosts.
