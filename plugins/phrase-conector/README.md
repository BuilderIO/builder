# Builder.io Phrase Integration Plugin

## Installation

From the integrations tab, pick `Phrase`, it'll ask you for your phrase user name and password, make sure the user has a `Project Manager` role.
![Phrase connector configuration screen](https://cdn.builder.io/api/v1/image/assets%2F1f098a44b17d4df688d2afdc8a10ac7d%2F92e44f756ac848bca5bdc6d9459d2bfc)

## Translating content
What's being translated:
- All text elements in builder content [you can exclude specific element by right click + `exclude from future translations`]
- All custom fields in content that are marked as `localized`
- All custom components inputs that are marked as `localized`


How To translate?
- once done with preparing content, publish it, and press the triple dots options menu on the top right of the editor:
![content options menu](https://cdn.builder.io/api/v1/image/assets%2F802a1eea7c44430aa23d4b9c708d07ad%2F846ed645d3bc478a923570c771aa9c47)

Then click Translate

![content translate action](https://cdn.builder.io/api/v1/image/assets%2F802a1eea7c44430aa23d4b9c708d07ad%2Fce44072c7f3f442db58c41c14bddb30d)


- it'll ask you for the source language and target languages and create a project in phrase with those configuration.
![pick project options](https://cdn.builder.io/api/v1/image/assets%2F802a1eea7c44430aa23d4b9c708d07ad%2F1833fe32768143aeb029819dfbe625af)
- once the project is completed, press on `Apply Translation` to get the translated values into your content.
- You can at any time restart the process by pressing on `Reset Translation`.

Future work:
- Automating the translation application on content once a project is completed in phrase.
