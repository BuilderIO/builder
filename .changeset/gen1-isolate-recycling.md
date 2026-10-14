---
'@builder.io/react': patch
---

Fix server-side memory growth from bindings by recycling the isolated-vm isolate every 1000 evaluations, and recover automatically if the isolate is disposed (e.g. after hitting its memory limit).
