---
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
---

Feat: Add support for passing `BlocksWrapperProps` to `<Blocks />` component. This allows overriding global props set via `<Content />` with specific props for individual Blocks instances. Note that local props completely replace global props unless manually merged.

Example usage:

```tsx
// Set global props, applies to all <Blocks />
<Content blocksWrapperProps={{ style: { padding: 10 } }} />

// Override global props
<Blocks BlocksWrapperProps={{ style: { backgroundColor: 'red' } }} />

// Merge global and local props
<Blocks
  BlocksWrapperProps={{
    ...props.builderContext.BlocksWrapperProps,
    style: { backgroundColor: 'red' } // applies both bg color and padding
  }}
/>
```
