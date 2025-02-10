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

- BREAKING CHANGE 🧨 : updated `subscribeToEditor` arguments:
    - arguments are now passed as a named argument object
    - `apiKey` is now a required field

Example:
    - from:
    ```ts
        subscribeToEditor('page', () => { ... }, options: {trustedHosts:['...']})
    ```
    - to:
    ```ts
        subscribeToEditor({
            apiKey: '...',
            model: '...',
            trustedHosts: ['...'],
            callback: () => { ... }
        })
    ```
