---
'@builder.io/sdk-react': major
'@builder.io/sdk-react-native': major
'@builder.io/sdk-solid': major
'@builder.io/sdk-svelte': major
'@builder.io/sdk-vue': major
'@builder.io/sdk-angular': minor
'@builder.io/sdk-react-nextjs': minor
'@builder.io/sdk-qwik': minor
---

Breaking Change 🧨: updated `shouldReceiveBuilderProps` config of Registered Components, with the following NEW defaults:

```ts
shouldReceiveBuilderProps: {
    builderBlock: true, // used to be `true`
    builderContext: true, // used to be `true`
    builderComponents: false, // unchanged
    builderLinkComponent: false, // unchanged
  },
```

This means that by default, the SDK will no longer provide any Builder props unless its respective config is explicitly set to `true`.
