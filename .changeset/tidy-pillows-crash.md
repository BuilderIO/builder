---
'@builder.io/sdk-react': minor
'@builder.io/sdk-angular': minor
'@builder.io/sdk-react-nextjs': minor
'@builder.io/sdk-qwik': minor
'@builder.io/sdk-react-native': minor
'@builder.io/sdk-solid': minor
'@builder.io/sdk-svelte': minor
'@builder.io/sdk-vue': minor
---

Add a `BuilderScripts` component that emits the Variant Container (`window.builderIoPersonalization`, `window.filterWithCustomTargeting`, `window.updateVisibilityStylesScript`) and A/B test (`window.builderIoAbTest`, `window.builderIoRenderContent`) helper scripts once for every `Content` rendered inside it. Wrap pages that render several `Content` components to avoid shipping a copy of these scripts per `Content`. A `BuilderScripts` nested inside another one emits nothing:

```tsx
<BuilderScripts nonce={cspNonce}>{children}</BuilderScripts>
```
