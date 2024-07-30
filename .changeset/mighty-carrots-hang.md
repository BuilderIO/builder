---
'@builder.io/sdk-angular': patch
---

Fix: `onInit` hook to run initialisations (converted to `ngOnInit`) on both server and client and move `onMount` and `onUpdate` hooks to only run on browser (converted to `ngOnInit` and `ngOnChanges` respectively with browser check)
