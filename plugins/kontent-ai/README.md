# Builder.io Kontent.ai plugin

Connect your Kontent.ai project data to your Builder.io project!

## Installation

Go to [builder.io/account/space](https://builder.io/account/space) and type `@builder.io/plugin-kontent-ai` in the text input.

![Installation screenshot](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2F9521aee97c2c40fa95750c2841e57f37)

Then hit save, you'll be prompted for to enter your `projectId`, which you can get from your ["Project Settings" > "API keys" in Kontent.ai application](https://kontent.ai/learn/tutorials/develop-apps/get-content/get-content-items/#a-1-find-your-project-id).

![Configuration screenshot](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2F2ce86dc1cd334f0980403cc5a57aa385)

## Usage

When you have data that resides in Kontent.ai that you want to use in your Builder app, you can use Builder's data provider plugin to fetch and display it on your site.

> For following showcase we are using tha sample project created in [Kontent.ai](https://kontent.ai/) for demonstration purposes - it's project ID is `975bf280-fd91-488c-994c-2f04416e5ee3`.

Once you have your plugin configured, your Builder.io project allow you to select items you what to use on your site.

First, create a new page and insert a text block to your page.

![Adding first text block](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2F449d4c0c99d2482bb824ea10d1cd87df)

Now let's connect data from Kontent.ai with Builder's page. Select data tab and use "Connect data" button to select Kontent.ai.

![Connect Kontent.ai with Builder.io's page](https://cdn.builder.io/api/v1/image/assets%2F0b9554e4c74747a08f247f55227230e0%2Fb6e1c8592d9a435c9ec936b5fb54db71)

Then pick the [content type](https://kontent.ai/learn/tutorials/references/terminology/#a-content-type) you want to select item(s) based on (i.e. `Article`).

![Picking content type](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2Ffcac7f18a9544a41b1f92b24ad760d07)

Pick a [content item](https://kontent.ai/learn/tutorials/references/terminology/#a-content-item) (entry) base on the content type you picked (i.e. `Coffee processing techniques`).

![Picking content item](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2Fe167b0d2ca7b4892afa2c55f6a4a53ec)

Edit text block properties (by double click on in) and select "Edit bindings".

![Open text block bindings settings](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2F168b8937434a4b8099204c0fb1f150f3)

Select the value of element (i.e. `title`'s value) - you can use search box for easier selection.

![Select title value to bindings](https://cdn.builder.io/api/v1/image/assets%2Fe85723a1cdde410591c232f4b375ef9b%2Feeb2c7fa678c422d8f3e83245b595366)

Now repeat for second text element (you don't need to pick an entry again) and set text clock binding to other element's value (i.e. `body_copy`).

![Setting second text block bindings](https://cdn.builder.io/api/v1/image/assets%2F0b9554e4c74747a08f247f55227230e0%2F0f18dfebebcf4ba99700eb5c3e83796d)

Finally tune up a style a little - set heading fon size to 32px site and edit layout around of the article to have 640px width and center it horizontally and here we go:

![Final article showcase](https://cdn.builder.io/api/v1/image/assets%2F0b9554e4c74747a08f247f55227230e0%2F2198adfdaf814cf3a85494477a0af1fb)
