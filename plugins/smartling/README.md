# Builder.io Smartling Integration Plugin [Alpha]

## Installation

From the plugins tab, pick `smartling`

## Translating content
What's being translated:
- All text elements in builder content [you can exclude specific element by right click + `exclude from future translations`]
- All custom fields in content that are marked as `localized`

From what language?
The source language should match your smartling project source locale.

To what languages?
By default it'll request translations for all target locales configured in your project locales, you can use the targeting UI to limit the translation request to a subset of those locales.

How To translate?
- prepare translation jobs by adding contents to draft jobs by pressing translate in content options or content list options [todo screenshots]
- once a translation job is ready for submission press `authorize`, this will send it to smartling.
- You apply translations [pending or completed] at any time after authorization from the option `apply translation`

Future work:
- Automating the translation application on content once a job is completed in smartling.
- Including custom components localized text inputs.

