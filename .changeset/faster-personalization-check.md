---
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-vue': patch
---

Faster check for personalization containers on each `<Content>`: the content walk no longer allocates an array for every object, which was about 2.5× slower on pages with large component options.
