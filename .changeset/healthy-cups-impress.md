---
'@builder.io/sdk-angular': patch
---

Feat: Add support for passing `BlocksWrapperProps` to `<blocks>` component. This allows overriding global props set via `<builder-content>` with specific props for individual blocks instances. Note that local props completely replace global props unless manually merged.

Example usage:

```html
<!-- Set global props, applies to all blocks -->
<builder-content [blocksWrapperProps]="{ style: { padding: '10px' } }"></builder-content>

<!-- Override global props -->
<blocks [BlocksWrapperProps]="{ style: { backgroundColor: 'red' } }"></blocks>

<!-- Merge global and local props -->
<blocks
  [BlocksWrapperProps]="{
    ...builderContext.BlocksWrapperProps,
    style: { backgroundColor: 'red' } // applies both bg color and padding
  }"
></blocks>
```
