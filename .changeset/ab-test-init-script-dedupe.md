---
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-react-native": patch
"@builder.io/sdk-solid": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-vue": patch
---

Stop injecting duplicate inline A/B test scripts on pages with multiple Content components. The `window.builderIoAbTest` / `window.builderIoRenderContent` init script is now only emitted when a Content actually renders A/B variants, and the definition is idempotent and self-removing on hydration targets. This avoids the duplication without the client-side DOM mutation that caused the previous hydration regression.
