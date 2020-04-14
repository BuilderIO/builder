<img alt="BUILDER" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F6836fc105ad549a5b4bf144235b1a228" width="300" />

Drag and drop page building with your code components. Bring your [design systems](/examples/react-design-system) to life!

<br />
<img src="https://imgur.com/HjBWIbv.gif" alt="Editor example" />

<table style="width:100%;">
  <tr>
    <td width="50%">Register components</td>
    <td>Rendered your visually created content</td>
  </tr width="50%">
  <tr>
    <td width="50%">
<pre lang="tsx">
import { Builder } from '@builder.io/react'
&nbsp;
// Register our heading component for use in 
// the visual editor
const Heading = props => (
  &lt;h1 className={style}&gt;{props.title}&lt;/h1&gt;
)
&nbsp;
Builder.registerComponent(Heading, { 
&nbsp;&nbsp;name: 'Heading',
&nbsp;&nbsp;inputs: [{ name: 'title', type: 'text' }]
})
</pre>
    
</td>
    <td width="50%">
<pre lang="tsx">
import { BuilderComponent } from '@builder.io/react'
&nbsp;
// Include this in your app, and Builder.io will render  
// the matching content by model name and the current document's URL.  
// Scroll down for more advanced options and examples
export default let BuilderPage = () => (
&nbsp;&nbsp;&lt;BuilderComponent model="page" /&gt;
)
</pre>
    </td>
  </tr>
</table>


## Who uses Builder.io?
&nbsp;
<img src="https://i.imgur.com/HXKroZm.jpg" />


## How does it work?

- Integrate the [Builder API or SDK](#supported-frameworks) to your site or app
- Create a free account on [builder.io](https://builder.io) and drag and drop to create and publish pages and content
- Profit

## What is it good for?

- Landing pages on custom code stacks
- [Design systems](/examples/react-design-system) and visually editing your custom components
- Marketing & content pages (Homepage, promotions, merchandising, about, FAQ, help, docs, etc)
- Freedom from marketing teams that never stop asking for new things
- Developers who are tired of pushing pixels

## Try it out!

- [builder.io/fiddle](https://builder.io/fiddle)
- Storybook [live example](https://builder-storybook.firebaseapp.com) and [source](https://github.com/BuilderIO/builder/tree/master/packages/storybook)
- Design system [live example](https://builder.io/fiddle/4b2e0a2e4b1a44a88a5e6f8c46cdfe7c) and [source](https://github.com/BuilderIO/builder/tree/master/examples/react-design-system)


## Supported Frameworks

| Framework                                                    |                            Status                             |
| ------------------------------------------------------------ | :-----------------------------------------------------------: |
| [REST API](https://builder.io/c/docs/getting-started)        |                            Stable                             |
| [React](#getting-started-with-react)                         |                            Stable                             |
| [Next.js](examples/next-js)                   |                            Stable                             |
| [Gatsby](examples/gatsby)                     |                            Stable                             |
| [Shopify / Liquid](packages/shopify)                        |                             Beta                              |
| [Angular](packages/angular)                                  |                            Stable                             |
| [React native](packages/react-native)                        |                             Beta                              |
| Email                                                        |                            Stable                             |
| AMP                                                          |                            Stable                             |
| Preact                                                       |                            Stable                             |
| **Everyting else** <br/> Go, Php, Java, Vue, Ruby/Rails, Vanilla JS, etc | Use our [HTML API](https://builder.io/c/docs/getting-started) |

Want suppoert for something not listed here or for us to priotize something coming soon? Drop us an issue and let us know! We prioritize based on the community's needs and interests.

## What's in this repository?

This repo houses all of the various [SDKs](packages), [usage examples](examples), [starter projects](starters), and [plugins](plugins)



## Getting Started with React

```sh
npm install @builder.io/react
```

Grab a free account at [builder.io](https://builder.io) and find your [API key](https://builder.io/account/organization)

Next, create a new page in Builder with URL `/something` and publish it.

Then, in your code:

```ts
import { builder, BuilderComponent } from '@builder.io/react';

builder.init(YOUR_KEY);
```

And in your router

```tsx
<Route path="/something" render={() => <BuilderComponent model="page" />}>
```

Create a new page with url "/something" in Builder and change the [preview URL](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4670438a077f497d8a486f890201ae85) to localhost:port/something (e.g. localhost:8888/something if your dev server is on port 8888) and edit!

See more info on setting up your [preview urls](https://www.builder.io/c/docs/guides/preview-url) here.

Also, see the full [React API here](https://github.com/BuilderIO/builder/blob/master/packages/react/README.md)


### Using your components

See this [design systems example](/examples/react-design-system) for lots of examples using your deisgn system + custom components + storybook

> 👉**Tip: want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)**

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
})

```

Then back at your page

```tsx
import './simple-text'

// ...

<Route path="/something" render={() => <BuilderComponent model="page">}>
```

Open the dashboard and use it!

See our [docs site](https://builder.io/c/docs/custom-react-components) for additional help and information, or contact us if you run into any issues or questions!

For lots of examples of using React components in Builder, see the source for our built-in Builder blocks [here](https://github.com/BuilderIO/builder/tree/master/packages/react/src/blocks) and widgets [here](https://github.com/BuilderIO/builder/tree/master/packages/widgets/src/components)



### Dynamic landing pages

👉**Tip:** see our guides for **[Next.js](examples/next-js)** and **[Gatsby](examples/gatsby)** for best support for those frameworks

One of Builder's most powerful features is allowing the creation of new pages for you. See a simple example of how to do this with react-router below:

```tsx
class CatchAllPage extends Component {
  state = {
    notFound: false,
  };

  render() {
    return !this.props.notFound ? (
      <BuilderComponent
        model="page"
        contentLoaded={content => {
          if (!content) {
            this.setState({ notFound: true });
          }
        }}
      >
        Loading...
      </BuilderComponent>
    ) : (
      <NotFound /> // Your 404 component
    );
  }
}

// Then in your app.js
export default () => (
  <Switch>
    <Route path="/" component={Home} />
    {/* Your other routes... */}
    <Route component={CatchAllPage} />
  </Switch>
);
```

For more advanced usage, like checking for page existence/404 on the server using the Content API, see our detail landing page docs [here](https://builder.io/c/docs/custom-landing-pages) or if using Next.js see our docs for that [here](https://github.com/BuilderIO/builder/tree/master/packages/react/examples/next-js#dynamic-landing-pages)

Also see a more complext [design system example here](/examples/react-design-system)

## Don't use React?

Our [HTML API](https://builder.io/c/docs/getting-started) works for any site

```javascript
let page = await request(
  `https://cdn.builder.io/api/v1/html/page?url=${PAGE_URL}&apiKey=${YOUR_KEY}`
);
if (page) {
  let html = page.data.html;
  // Put the html in your page template between your header and footer and you are done!
}
```

## We're hiring!

Want to work on the future of visual software development? Email me at steve@builder.io and let's talk

## John the community!

Questions? Requests? Feedback? Chat with us in our [official forum](https://forum.builder.io)!

## Troubleshooting and feedback

Problems? Requests? Open an [issue](https://github.com/BuilderIO/builder/issues). We always want to hear feedback and interesting new use cases and are happy to help.
