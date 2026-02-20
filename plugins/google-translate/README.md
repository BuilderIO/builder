# Extend the builder.io UI with a Translate tab

Enabling you to easily translate entire content entries or just the selected block to any or all of the locales enabled in your account.

## Setup
1. Follow this guide to [add Locales to your builder.io account](https://www.builder.io/c/docs/add-remove-locales).
1. Follow this setup process to get your [Google Cloud Project setup and the Translation API enabled](https://cloud.google.com/translate/docs/setup).

    You will have to enable billing for your project and the price will be charged to your method on file at [these rates](https://cloud.google.com/translate/pricing#basic-pricing). The implementation of this plugin only uses the Basic version to translate text / html. Currently there is a generous free tier "First 500,000 characters* per month. Free (applied as $10 credit every month)."

1. You should then be able to [create an API key](https://cloud.google.com/docs/authentication/api-keys)
1. Enable this plugin in your builder account and paste the Google Translation API key into the plugin's settings.
1. You should now be able to see a "TRANSLATE" tab on any content entry page.
![Translate Tab](https://i.imgur.com/hOHgezA.png)

By default the "all text blocks" and "all locales" options are selected. The intention is that it is easy for a content editor to immediately go to an entry and translate the entire page.

You have the option to narrow down what will be translated by selecting "this text block" - which refers to the currently selected layer in your Layers tab. You can also select any of the locales enabled in your builder account.

By using these options the user is given more fine grained control in case they want to translate only a particular part of a content entry to a certain language. This is in the case that they want to redo some part in case it was lost or changed in an undesirable way.

Please see [the full demo walkthrough on YouTube](https://youtu.be/BVkltuj8RYM).