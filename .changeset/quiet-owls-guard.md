---
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-vue': patch
---

Fix: ignore `__proto__`, `constructor` and `prototype` paths in Studio `builder.userAttributes.*` query parameters so a crafted preview URL cannot pollute `Object.prototype`
