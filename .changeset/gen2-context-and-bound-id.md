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

Fix custom code that worked in Gen1:

- Functions that content `jsCode` adds to `context` (e.g. `context.calcHours = ...`) are now callable from block actions and bindings when no `context` prop is passed to `Content`. Previously `jsCode` wrote them to a throwaway object.
- React: state writes made by `jsCode` after its first run (from functions it defines, timers, or fetch callbacks) now re-render the content.
- A binding on `id` sets the element's `id` attribute, as in Gen1, instead of replacing the block's Builder id.
