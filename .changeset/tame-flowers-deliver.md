---
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-solid": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-vue": patch
---

Fix duplicate text after SSR hydration when paragraph wrappers contain built-in Text blocks, including nested Text blocks. Preserve valid paragraph wrappers and custom Text overrides.
