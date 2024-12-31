---
"@builder.io/react": patch
---

In symbol content-input, the editor wasn't able to clear the image unless page is realoaded. So this is fixed by removing "Builder.isEditing" check so a new "dataString" is generated with evry new data.
Issue ticket - https://builder-io.atlassian.net/browse/ENG-6884
