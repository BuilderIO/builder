# Builder.io Preview Logic plugin

This plugin allow advanced computation of the preview url inside Builder's editor, useful for cases where you have a special routing logic in your preview site based on the content [`custom fields`](https://www.builder.io/c/docs/custom-fields) or [`targeting attributes`](https://www.builder.io/c/docs/guides/targeting-and-scheduling#custom-targeting), for example routing based on locales.

## Installation

Go to [builder.io/account/space](https://builder.io/account/space) and type `@builder.io/plugin-preview-logic` in the text input, then hit save.

![Installation screenshot](https://cdn.builder.io/api/v1/image/assets%2F7e009cfd7ded4edbb6aee739b73bebe8%2F72195747941447599f2387943c206ee6)

After hitting save, the app will reload with the plugin code installed,

Now from the same menu, hit `edit plugin settings`

![Plugin Settings screenshot](https://cdn.builder.io/api/v1/image/assets%2F7e009cfd7ded4edbb6aee739b73bebe8%2F8026504d292c4875b8bb79fac0e5fdcf)

Add a preview setting by hitting `+ preview setting`

Pick the model you'd like to add the preview setting to

![Model picker screenshot](https://cdn.builder.io/api/v1/image/assets%2F7e009cfd7ded4edbb6aee739b73bebe8%2F25cf95231e55444490eeb97a913a41bf)

Write the code you'd like to run to compute the preview url, in this code you'll have access to three objects:

- `content`: a json representation fo the current state of content, access properties directly for example: `content.data.title`
- `space`: the space settings: siteUrl, name, publicKey
- `targeting` an object represeting the content targeting settings, for example: `targeting.urlPath`

Always return a string representing the final preview URL you'd like the app to use.
