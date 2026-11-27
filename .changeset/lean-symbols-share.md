---
"@builder.io/sdk-angular": patch
---

Deduplicate identical inline `<style>` tags across Symbol instances and repeated blocks. Each unique block of CSS is now emitted once and shared, reducing server-rendered HTML size on pages that reuse Symbols.
