---
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Feature: add `contentWrapper`, `contentWrapperProps`, `blocksWrapper`, `blocksWrapperProps` props to Content:

```ts
{
 /**
   * The element that wraps your content. Defaults to `div` ('ScrollView' in React Native).
   */
  contentWrapper?: any;
  /**
   * Additonal props to pass to `contentWrapper`. Defaults to `{}`.
   */
  contentWrapperProps?: any;
  /**
   * The element that wraps your blocks. Defaults to `div` ('ScrollView' in React Native).
   */
  blocksWrapper?: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  blocksWrapperProps?: any;
}
```
