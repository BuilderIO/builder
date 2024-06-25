## Builder.io custom design system example with React

> ✨ **Try it live [here](https://builder.io/fiddle/4b2e0a2e4b1a44a88a5e6f8c46cdfe7c)**!

In this example we show how to integrate react components with [Builder.io](https://builder.io). This is useful when you want to add the ability for your team to utilize custom components on the pages you build using the Builder editor, or even want to make it so people on your team can only build and edit your site's pages using your custom components.

> ⚛️ For server side rendered examples see our [Next.js](https://github.com/BuilderIO/builder/tree/main/examples/next-js) and [Gatsby](https://github.com/BuilderIO/gatsby-starter-builder) examples

The source code for the custom components used in this demo are [here](src/components), and you can see how they are registered with Builder by looking at the files that end in `*.builder.js` ([this is an example](https://github.com/BuilderIO/builder/blob/main/examples/react-design-system/src/components/ProductsList/ProductsList.builder.js)). The logic for adding components to the Builder editor menu can be found [here](https://github.com/BuilderIO/builder/blob/main/examples/react-design-system/src/builder-settings.js)

> 👉**Tip:** want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)

<img src="https://imgur.com/PJW3b4S.gif" alt="example" />

### To run the example Locally

- [Sign in or create an account](https://builder.io/login)
- Create a new page
- Clone and start the project:

### Clone and install dependencies

using git

```bash
git clone https://github.com/BuilderIO/builder.git
cd examples/react-design-system
npm install
```

### Install the Builder CLI

```
npm install @builder.io/cli -g
```

### Generate your Builder.io space

<!-- TODO: link "private key" to a forum post or doc showing how to create that -->

[Signup for Builder.io](https://builder.io/signup), then go to your [organization settings page](https://builder.io/account/organization?root=true), create a private key and copy it, then create your space and give it a name

From the `examples/react-design-system` folder

```
builder create -k [private-key] -n [space-name] -d
```

This command when done it'll print your new space's public api key, copy it and add as the value for `YOUR_KEY` in [builder-settings](./src/builder-settings.js)

```
YOUR_KEY=...
```

### Run the dev server

```
npm run start
```

It'll start a dev server at `http://localhost:3000`

<img width="796" alt="Screen Shot 2020-02-18 at 9 48 51 AM" src="https://user-images.githubusercontent.com/5093430/74763082-f5457100-5233-11ea-870b-a1b17c7f99fe.png">

This will allow Builder to read in all your custom component logic and allow your team to edit and build using your components.

When you deploy this to a live or staging environment, you can change the preview URL for your model globally from [builder.io/models](https://builder.io/models) (see more about models [here](https://builder.io/c/docs/guides/getting-started-with-models) and preview urls [here](https://builder.io/c/docs/guides/preview-url))
