---
"@builder.io/sdk": patch
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-react-native": patch
"@builder.io/sdk-solid": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-vue": patch
---

Types: add optional `group?: string` to the component metadata type used by `Builder.registerComponent`, so TypeScript integrations can bucket custom components into their own accordions in the editor's insert menu without excess-property errors.
