---
"@builder.io/react": patch
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-react-native": patch
"@builder.io/sdk-solid": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-vue": patch
---

Fix Image block srcset so the original image URL is only included when it has a width descriptor, preventing browsers from downloading the full-size original image on standard-density screens.
