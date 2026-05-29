---
'@builder.io/sdk-angular': minor
---

🚨 Breaking Change

- Remove the deprecated `allowSignalWrites` flag from generated Angular `effect()` calls, which was deprecated in Angular v19 and only emitted console warnings. The SDK now requires Angular v19.0.0 and above.
