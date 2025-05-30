---
'@builder.io/sdk-angular': minor
---

🚨 Breaking Change
Refactor Angular SDK to leverage Angular v17+ features (signals, computed, inputs, declarative statements, etc.).

- Performance revamp: Recomputations now occur only when a dependent signal updates, instead of on every change detection cycle.
- Components with children no longer re-render on each change, eliminating sluggish interactions in the Visual Editor.

The SDK will only work for apps with Angular v17.3.0 and above
