# @builder.io/gatsby

Plugin for integrating [Builder.io](https://www.builder.io) to allow drag and drop page building with Gatsby. It puts the Builder.io schema under an `allBuilderModels` field of the Gatsby GraphQL query, If a templates map is passed as option, this plugin will create gatsby pages dynamically for each page entry in builder.io on the path specified.

<img src="https://imgur.com/PJW3b4S.gif" alt="example" />

## Install

`npm install @builder.io/gatsby`

## How to use

Make a free account over at [Builder.io](https://www.builder.io/) and grab your public API key from your [organization page](https://builder.io/account/organization) and:

```javascript
// In your gatsby-config.js
const path = require('path');
module.exports = {
  plugins: [
    {
      resolve: '@builder.io/gatsby',
      options: {
        // public API Key
        publicAPIKey: 'MY_PUBLIC_API_KEY',
        // optional
        // mapping model names to template files, the plugin will create a page for each entry of the model at its specified url
        templates: {
          // `page` can be any model of choice, camelCased
          page: path.resolve('templates/my-page.tsx'),
        },
        // optional
        mapEntryToContext: async ({ entry, graphql }) => {
          const result = await graphql('....');
          return {
            property: entry.data.property,
            anotherProperty: entry.data.whatever,
            dataFromQuery: result.data
            /* ... */
          };
        },
        // optional, to resolve a single entry to multiple, for e.g in localization
        resolveDynamicEntries: async (entries) => {
          const entriesToBuild = []
          for entry of entries {
            if (entry.data.myprop.isDynamic){
               entriesToBuild.push(await myEntryResolver(entry))
            }
            else {
               entriesToBuild.push(entry)
            }
          }
          return entriesToBuild;
        },
      },
    },
  ],
};
```

Then start building pages in Builder.io, hit publish, and they will be incluced in your Gatsby site on each new build!

For a more advanced example and a starter check out [gatsby-starter-builder](https://github.com/BuilderIO/gatsby-starter-builder)

## Using your components in the editor

See this [design systems example](/examples/react-design-system) for lots of examples using your deisgn system + custom components

👉**Tip: want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)**

Register a component

```tsx
import { Builder } from '@builder.io/react';

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>;
  }
}

Builder.registerComponent(SimpleText, {
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }],
});
```

## How to Query

For an up-to-date complete examples check out the [Gatsby + Builder.io starter](https://github.com/BuilderIO/gatsby-starter-builder)

```graphql
{
  allBuilderModels {
    myPageModel(options: { cachebust: true }) {
      content
    }
  }
}
```

## Learn more

- [Gatsby + Builder.io starter](https://github.com/BuilderIO/gatsby-starter-builder)
- [Design system example](https://github.com/BuilderIO/builder/tree/master/examples/react-design-system)
- [Official docs](https://www.builder.io/c/docs/getting-started)
