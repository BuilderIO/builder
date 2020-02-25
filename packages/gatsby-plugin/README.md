# @builder.io/gatsby

Plugin for integrating [Builder.io](https://www.builder.io) to allow drag and drop page building with Gatsby. It puts the Builder.io schema under an `allBuilderModels` field of the Gatsby GraphQL query, If a templates map is passed as option, this plugin will create gatsby pages dynamically for each page entry in builder.io on the path specified.

## Install

`npm install @builder.io/gatsby`

## How to use

```javascript
// In your gatsby-config.js
const path = require("path")
module.exports = {
  plugins: [
    {
      resolve: "@builder.io/gatsby",
      options: {
        // public API Key
        publicAPIKey: "MY_PUBLIC_API_KEY",
        templates: {
          // `page` can be any model of choice, camelCased
          page: path.resolve("templates/my-page.tsx"),
        },
      },
    },
  ],
}
```

## How to Query

For an up-to-date complete examples check out the examples on [BuilderIO/examples/gatsby](https://github.com/BuilderIO/builder/tree/master/examples/gatsby)

```graphql
{
  allBuilderModels {
    myPageModel {
      content
    }
  }
}
```
