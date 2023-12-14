---
'@builder.io/sdk-react': patch
---

Fix: Stringify inlined SSR A/B test scripts at build-time. Avoids hydration mismatches caused by run-time stringification.
