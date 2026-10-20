---
"@builder.io/sdk-react-native": patch
"@builder.io/sdk-angular": patch
"@builder.io/sdk-react-nextjs": patch
"@builder.io/sdk-svelte": patch
"@builder.io/sdk-react": patch
"@builder.io/sdk-solid": patch
"@builder.io/sdk-qwik": patch
"@builder.io/sdk-vue": patch
"@builder.io/react": patch
---

Fix: persist A/B test assignment cookie (`builder.tests.<contentId>`) for 30 days instead of the session, matching `setTestCookie` in core
