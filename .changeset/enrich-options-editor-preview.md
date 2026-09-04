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

Add `enrichOptions` to `fetchOneEntry` and to `Content`, so reference enrichment can be constrained (`enrichLevel`, per-model `fields`/`omit`) and the Visual Editor is told which constraints your site fetches with.
