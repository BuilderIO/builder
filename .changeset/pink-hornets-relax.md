---
'@builder.io/sdk-vue': minor
---

Fix: remove the need for users to manually import CSS stylesheet.
Breaking: remove the CSS stylesheet exports:
  - `import '@builder.io/sdk-vue/css'`
  - `import '@builder.io/sdk-vue/vue2/css'`
  - `import '@builder.io/sdk-vue/vue3/css'`
If you were using these, all you have to do is remove the import, since the import was moved to the SDK internals.
