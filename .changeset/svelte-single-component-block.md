---
'@builder.io/sdk-svelte': patch
---

Faster server rendering and hydration for the Svelte SDK, with the same HTML output:

- Block getters are now memoized in the published Svelte SDK. The previous release enabled this, but the build was using a Mitosis version that ignored the option, so every block recomputed its processed block, component and props many times per render.
- Each block now renders through one Svelte component instead of nine. Its styles, wrapper element and component are inlined, and its values are computed once per change.
- Each `<Content>` renders the styles of its static blocks (no bindings or repeats) in one `<style>` tag, instead of a tag per block. The CSS rules are unchanged; pages are smaller and hydrate faster.
