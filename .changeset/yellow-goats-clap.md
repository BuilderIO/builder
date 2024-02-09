---
'@builder.io/sdk-vue': major
'@builder.io/sdk-react': major
'@builder.io/sdk-react-native': major
'@builder.io/sdk-svelte': major
'@builder.io/sdk-react-nextjs': minor
'@builder.io/sdk-qwik': minor
'@builder.io/sdk-solid': minor
---

- 🧨 Breaking changes: this release removes the following deprecations:

Exports:

- `RenderBlocks` -> `Blocks`
- `RenderContent` -> `Content`
- `getContent` -> `fetchOneEntry`
- `getAllContent` -> `fetchEntries`

Arguments/Props:

- `Content`'s `includeRefs` prop is removed in favor of `enrich`.
- `fetchOneEntry`'s `includeRefs` and `noTraverse` arguments are removed in favor of `enrich`.

Functionality:

- removed deprecated side-effect `registerComponent()`. Instead, use the `customComponents` prop of `Content`.
