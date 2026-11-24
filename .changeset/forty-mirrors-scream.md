---
"@builder.io/react": patch
---

Fix a hydration bug in Dynamic Containers that could break accessibility references by generating different `useId` values on the server and client.
