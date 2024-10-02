---
'@builder.io/react': patch
---

This introduces two new custom events to enhance tracking and analytics for personalization container variants:

1. `builder.variantLoaded`: Fired when a variant is loaded.
2. `builder.variantDisplayed`: Fired when a variant becomes visible in the viewport.

### Changes

- Added `builder.variantLoaded` event dispatch when a variant is loaded.
- Implemented an Intersection Observer to trigger the `builder.variantDisplayed` event when the variant enters the viewport.
- These events are only fired when not in editing or preview mode.

### Example Usage

These events can be listened to for analytics or other custom behaviors:

```javascript
document.addEventListener('builder.variantLoaded', event => {
  // This will either be a variant object like { name: 'My Variant', query: [...], startDate: ..., endDate: ... }
  // or the string 'default'
  console.log('Variant loaded:', event.detail.variant);
  // This will be the content object like { name: 'My page', id: '...', ... }
  console.log('Content:', event.detail.content);
  // Perform analytics or other actions
});

document.addEventListener('builder.variantDisplayed', event => {
  console.log('Variant displayed:', event.detail.variant);
  console.log('Content:', event.detail.content);
  // Track impressions or perform other visibility-dependent actions
});
```

### Benefits

- Improved tracking capabilities for personalization variants.
- Enables more granular analytics for when variants are loaded and actually viewed.
- Provides hooks for developers to implement custom behaviors based on variant lifecycle events.
