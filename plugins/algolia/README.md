# Builder.io Algolia plugin

By syncing your Builder content to Algolia, you can easily add super-charged search of your product data, landing pages or even custom data models.

## Installation

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the plugin from the plugin settings (`@builder.io/plugin-algolia`)

![Installation screenshot](https://cdn.builder.io/api/v1/image/assets%2Fc323eb63ba4f413fb404381a691aff97%2Fc15c13b0d4c84a2da793df52f0564b42)

The page will reload, asking you to enter in your Algolia account credentials. You can find your Account Id in the URL of the Algolia dashboard or in the top left of your dashboard:
`https://www.algolia.com/apps/<account-id>/dashboard`

You'll need to create an Algolia API key and ensure that it has the correct [ACL permissions](https://www.algolia.com/doc/guides/security/api-keys/#rights-and-restrictions), most importantly `addObject`, `deleteObject` and `search`.

Here's an example of the permissions you'll want to enter on the Create API Key form located at `www.algolia.com/apps/<your-account-id>/api-keys/restricted`:
![Create API Form](https://cdn.builder.io/api/v1/image/assets%2Fc323eb63ba4f413fb404381a691aff97%2Fb6a16f09c5df496d8160e02da7b2bc2a)

## Syncing Model Data

Now that you have the plugin set up, you can start syncing your model content. First, head over to the Builder Model that you want to sync.

Click the More Options button above the model fields, then you'll see a button at the bottom of the Show More Options section, click this button and your existing content will automatically be sent to Algolia with the index name `builder-modelName`.

![Builder Model Sync to Algolia](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F84665735c1c3430696f3d382f23bec40)

## Adding Algolia Search Inputs via Builder

We have plans to add pre-built Search interfaces to the plugin, in the meatime, you can use the [Algolia APIs](https://www.algolia.com/doc/api-client/getting-started/what-is-the-api-client/javascript/?client=javascript) or a library like [InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)
