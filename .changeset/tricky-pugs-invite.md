---
'@builder.io/react': patch
---

Fix: A/B test variation previews no longer flash the default variation before switching. The `builder.tests.<contentId>` URL parameter is now applied when the SSR variants script selects a variation, so the first paint matches what React renders during hydration.
