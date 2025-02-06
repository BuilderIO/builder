---
"@builder.io/sdk-angular": minor
"@builder.io/sdk-react-nextjs": minor
"@builder.io/sdk-qwik": minor
"@builder.io/sdk-react": major
"@builder.io/sdk-react-native": major
"@builder.io/sdk-solid": major
"@builder.io/sdk-svelte": major
"@builder.io/sdk-vue": major
---

- BREAKING CHANGE :firecracker: : updated subscribeToEditor arguments:
from:
    subscribeToEditor('page', () => { ... }, options: {trustedHosts:['...']})
to:
    subscribeToEditor({
        apiKey: '...',
        model: '...',
        trustedHosts: ['...'],
        callback: () => { ... }
    })
