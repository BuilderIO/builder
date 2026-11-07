---
'@builder.io/sdk': patch
---

Fix: skip the `eval` used to detect `require` in browsers so importing the SDK no longer triggers a Content Security Policy violation
