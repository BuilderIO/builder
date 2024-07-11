---
'@builder.io/sdk-angular': minor
'@builder.io/sdk-react-nextjs': minor
'@builder.io/sdk-qwik': minor
'@builder.io/sdk-react': minor
'@builder.io/sdk-react-native': minor
'@builder.io/sdk-solid': minor
'@builder.io/sdk-svelte': minor
'@builder.io/sdk-vue': minor
---

Feature: add `shouldReceiveBuilderProps` config to Registered Components, with a default that provides all Builder props.

Example:

```ts
export const componentInfo = {
  name: 'Text',

  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderContext: false,
    builderComponents: true,
    builderLinkComponent: false,
  },

  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      autoFocus: true,
      bubble: true,
      defaultValue: 'Enter some text...',
    },
  ],
};
```
