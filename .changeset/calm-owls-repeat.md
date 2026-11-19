---
'@builder.io/sdk-angular': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Fix Accordion `useChildrenForItems` so static and repeated child blocks render as accordion items with the correct repeat context, without rendering the raw children a second time.
