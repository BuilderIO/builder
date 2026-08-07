---
'@builder.io/sdk-react': patch
'@builder.io/sdk-vue': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-react-native': patch
---

Stop injecting personalization inline scripts on pages that do not use them. The `window.builderIoPersonalization` / `window.filterWithCustomTargeting` / `window.updateVisibilityStylesScript` init script was emitted once per top-level `Content` regardless of whether any Variant Container was present. It is now emitted only by a `Content` whose blocks actually contain one, and the definitions are idempotent — matching the treatment `window.builderIoAbTest` received previously.
