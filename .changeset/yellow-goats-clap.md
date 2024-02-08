---
'@builder.io/sdk-vue': major
'@builder.io/sdk-react': major
'@builder.io/sdk-react-native': major
'@builder.io/sdk-svelte': major
'@builder.io/sdk-react-nextjs': minor
'@builder.io/sdk-qwik': minor
'@builder.io/sdk-solid': minor
---

- 🧨 Breaking change: remove deprecated exports and attributes:

- `RenderBlocks` and `RenderContent` exports, in favor of `Blocks` and `Content`.
- `Content`'s `includeRefs` prop, in favor of `enrich`.
- `fetchOneEntry`'s `includeRefs` and `noTraverse` parameters, in favor of `enrich`.
