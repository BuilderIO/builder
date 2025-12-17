---
"@builder.io/sdk": minor
"@builder.io/react": minor
---

Feat: Add support for `enrichOptions` parameter to control reference enrichment depth and field selection when fetching content.

This feature allows you to:
- Control the depth level of nested reference enrichment (up to 4 levels)
- Selectively include/exclude fields for each referenced model type
- Optimize API responses by fetching only the data you need

Example usage:

```typescript
// Basic enrichment with depth control
await builder.getAll('page', {
  enrich: true,
  enrichOptions: {
    enrichLevel: 2  // Fetch 2 levels of nested references
  }
});

// Advanced: Selective field inclusion per model
await builder.getAll('page', {
  enrich: true,
  enrichOptions: {
    enrichLevel: 3,
    model: {
      'product': {
        fields: 'id,name,price',
        omit: 'data.internalNotes'
      },
      'category': {
        fields: 'id,name'
      }
    }
  }
});
```
