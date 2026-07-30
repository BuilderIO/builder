---
'@builder.io/sdk-angular': patch
---

Fix: edits made in the Visual Editor no longer revert to the initially rendered content.

The `props.content` update hook is compiled to an Angular `effect()` that tracks every
signal read in its body instead of the declared dependency list. Any unrelated context
update therefore re-ran the hook and re-merged the original page-load `props.content`
over content received from the editor. Guard the merge with a `prevContent` check, the
same pattern already used by the neighbouring `props.data` and `props.locale` hooks.
