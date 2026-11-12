---
"@builder.io/react": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-vue": patch
---

Fix Variant Container server HTML leaking content for other locales. Variants whose locale targeting can't match the page locale are no longer rendered, and the inline personalization script no longer embeds variant blocks.
