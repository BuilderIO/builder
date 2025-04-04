---
'@builder.io/sdk-vue': patch
---

Feat: Add support for passing `BlocksWrapperProps` to `<Blocks />` component. This allows overriding global props set via `<Content />` with specific props for individual Blocks instances. Note that local props completely replace global props unless manually merged.

Example usage:

```vue
<!-- Set global props, applies to all <Blocks /> -->
<Content :blocksWrapperProps="{ style: { padding: '10px' } }" />

<!-- Override global props -->
<Blocks :BlocksWrapperProps="{ style: { backgroundColor: 'red' } }" />

<!-- Merge global and local props -->
<Blocks
  :BlocksWrapperProps="{
    ...builderContext.BlocksWrapperProps,
    style: { backgroundColor: 'red' }, // applies both bg color and padding
  }"
/>
```
