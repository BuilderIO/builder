<h2>Builder SDKs</h2>
<br />
<img src="https://imgur.com/lHDo3Mq.gif" alt="Editor example" />

## What is it good for?

- Landing pages
- Marketing pages (Homepage, etc)
- Content pages (About, FAQ, etc)
- Marketing teams that never stop asking for changes
- Developers who are tired of pushing pixels

## Supported Frameworks

| Framework                                                    |                                                               Status                                                                |             Supports using your custom components              |                      SSR supported                      |
| ------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------: | :-----------------------------------------------------: |
| [React](#getting-started-with-react)                         |                                                               stable                                                                |                              Yes                               |                           Yes                           |
| [Next.js](packages/react/examples/next-js)                   |                                                               stable                                                                |                              Yes                               |                           Yes                           |
| [Webcomponents](https://builder.io/c/docs/webcomponents-sdk) |                                                               stable                                                                |                              Yes                               | Yes with [HTML API](https://builder.io/c/docs/html-api) |
| [Angular](packages/angular)                                    |                                                               stable                                                                | Yes with [angular elements](https://angular.io/guide/elements) |                           Yes                           |
| Email                                                        |                                                               stable                                                                |                              Yes                               |                           Yes                           |
| Preact                                                       |                                                                beta                                                                 |                              Yes                               |                           Yes                           |
| Vue                                                          |                                  Use [webcomponents](https://builder.io/c/docs/webcomponents-sdk)                                   |                          Coming soon                           |                       Coming soon                       |
| React native                                                 |                                                             Coming soon                                                             |                          Coming soon                           |                           n/a                           |
| Shopify                                                      |                                                             Coming soon                                                             |                          Coming soon                           |                       Coming soon                       |
| Wordpress                                                    |                                                             Coming soon                                                             |                          Coming soon                           |                       Coming soon                       |
| **Everyting else** - Go, Php, Svelte, Java, Vanilla JS, etc      | Stable - Use our [HTML API](https://builder.io/c/docs/html-api) and/or [webcomponents](https://builder.io/c/docs/webcomponents-sdk) |                    Yes (your webcomponents)                    |                           Yes                           |

Want suppoert for something not listed here or for us to priotize something coming soon? Drop us an issue and let us know! We prioritize based on the community's needs and interests.

## Getting Started with React

```sh
npm install --save @builder.io/react
```

Grab a free account at [builder.io](https://builder.io) and find your [API key](https://builder.io/account/organization)

```ts
import { builder, BuilderComponent } from '@builder.io/react';

builder.init(YOUR_KEY);
```

Then in your router

```tsx
<Route path="/something" render={() => <BuilderComponent model="page" />}>
```

Create a new page and open your-dev-url:port/something and edit!

See our [docs site](https://builder.io/c/docs/react) for more info or contact us if you run into any issues or questions!

### Using your components

Wrap a component

```tsx
import { BuilderBlock } from '@builder.io/react';

@BuilderBlock({
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }],
})
export class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>;
  }
}
```

Then back at your page

```tsx
import './simple-page'

// ...

<Route path="/something" render={() => <BuilderComponent model="page">}>
```

Open the dashboard and use it!

See our [docs site](https://builder.io/c/docs/custom-react-components) for additional help and information, or contact us if you run into any issues or questions!

For lots of examples of using React components in Builder, see the source for our built-in Builder blocks [here](https://github.com/BuilderIO/builder/tree/master/packages/react/src/blocks) and widgets [here](https://github.com/BuilderIO/builder/tree/master/packages/widgets/src/components)

For Builder decorator support you need to be using typescript or babel with legacy decorators.
Alternatively you can use the alternative syntax:

```tsx
import { BuilderBlock } from '@builder.io/react';

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>;
  }
}

BuilderBlock({
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }],
})(SimpleText);
```

### Dynamic landing pages

One of Builder's most powerful features is allowing the creation of new pages for you. See a simple example of how to do this with react-router below:

```tsx
class CatchAllPage extends Component {
  state = {
    notFound: false,
  };

  render() {
    return this.props.notFound ? (
      'Page not found'
    ) : (
      <BuilderComponent
        name="page"
        onContentLoad={content => {
          if (!content) {
            this.setState({
              notFound: true,
            });
          }
        }}
      >
        Loading...
      </BuilderComponent>
    );
  }
}

// Then in your app.js
export default () => (
  <Switch>
    <Route path="/" component={Home} />
    {/* Your other routes... */}
    {/* IMPORTANT: Be sure the patchall is your LAST route so it only loads if nothing else matches! */}
    <Route component={CatchAllPage} />
  </Switch>
);
```

For more advanced usage, like checking for page existence/404 on the server using the Content API, see our detail landing page docs [here](https://builder.io/c/docs/custom-landing-pages) or if using Next.js see our docs for that [here](https://github.com/BuilderIO/builder/tree/master/packages/react/examples/next-js#dynamic-landing-pages)

## Don't use React?

Builder webcomponents support all sites and frameworks!

```html
<script src="https://cdn.builder.io/js/webcomponents"></script>
<builder-component name="page"></builder-component>
```

See our official docs on Builder Webcomponents [here](https://builder.io/c/docs/webcomponents-sdk)

Additionally see our [HTML API](https://builder.io/c/docs/html-api) for server side rendering

## Troubleshooting and feedback

Problems? Requests? Open an issue. We always want to hear feedback and interesting new use cases and are happy to help.
