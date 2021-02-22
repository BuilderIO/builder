<p align="center">
  <img alt="BUILDER" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fdcd545fcda9c4be796889bf072cf72e9" width="250" />
</p>
<br />
<p align="center">
  Drag and drop page building with your code components. Bring your <a href="/examples/react-design-system">design systems</a> to life!
</p>

<br />
<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/builderio/builder/pulls"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/BuilderIO/builder"><img alt="License" src="https://img.shields.io/github/license/BuilderIO/builder" /></a>
  <a href="https://www.npmjs.com/package/@builder.io/sdk"><img alt="Types" src="https://img.shields.io/npm/types/@builder.io/sdk" /></a>
</p>
<br />

<p align="center">
  <img src="https://imgur.com/HjBWIbv.gif" alt="Editor example" />
</p>

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
import { BuilderComponent, builder } from '@builder.io/react'
&nbsp; 
builder.init('YOUR_KEY')
&nbsp; 
export default let BuilderPage = () => {
&nbsp;&nbsp;const [pageJson, setPage] = useState(null)
&nbsp;
&nbsp;&nbsp;useEffect(() => { 
&nbsp;&nbsp;&nbsp;&nbsp;builder.get('page', { url: '/' })
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.promise().then(setPage)
&nbsp;&nbsp;, [])
&nbsp;
&nbsp;&nbsp;return &lt;BuilderComponent model="page" content={pageJson} />
}

</pre>
    </td>
  </tr>
</table>

## Who uses Builder.io?

&nbsp;
<img src="https://i.imgur.com/HXKroZm.jpg" />

## Try it out!

- [builder.io/fiddle](https://builder.io/fiddle)
- Component-driven design system [live example](https://builder.io/fiddle/4b2e0a2e4b1a44a88a5e6f8c46cdfe7c) and [source](https://github.com/BuilderIO/builder/tree/master/examples/react-design-system)
- [JSX Lite](https://github.com/BuilderIO/jsx-lite)
- [VSCode plugin](https://github.com/BuilderIO/vscode)
- Convert [Figma designs to code](https://github.com/BuilderIO/html-figma)
- Storybook [live example](https://builder-storybook.firebaseapp.com) and [source](https://github.com/BuilderIO/builder/tree/master/packages/storybook)

## How does it work?

- Integrate the [Builder API or SDK](https://www.builder.io/c/docs/getting-started) to your site or app
- Create a free account on [builder.io](https://builder.io) and drag and drop to create and publish pages and content

## How is the content structured?

In Builder, content is structured in [models](https://www.builder.io/c/docs/guides/getting-started-with-models), and customized with [custom fields](https://www.builder.io/c/docs/custom-fields) and [targeting](https://www.builder.io/c/docs/guides/targeting-and-scheduling)

- **Builder pages** - full drag and drop control between your site's header and footer. [Try it out](https://builder.io/fiddle/fb98adf93ad5467180329fdaa9711f27)
- **Builder sections** - make a part of a page visually editable in Builder and use our [targeting and scheduling](https://www.builder.io/c/docs/guides/targeting-and-scheduling) to decide who sees what. [Try it out](https://builder.io/fiddle/81b6a689f6c74c82bbd982497cf08e34)
- **Builder data** - fetch structured data from Builder and use it anywhere in your application (e.g. menu items, structured pages). [Try it out](https://builder.io/fiddle/193e3e3128b84c80b1a9c4ba19612244)

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fe809eac6ae7140beab81ce4c3ee75e20" />

Read more about how builder works [here](https://www.builder.io/c/docs/how-builder-works)

See [here](#structuring-your-site) for examples on how to structure a site with Builder

## Featured Integrations

<a target="_blank" href="https://www.builder.io/c/docs/getting-started">
  <img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff956ac27f99e47cfa81fbba8213da1e3" />
</a>

<br />

<table>
  <tbody>
    <tr>
      <td width="100px" align="center" valign="middle">
        <a target="_blank" href="https://www.builder.io/c/docs/getting-started">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7c16907175964f5dada038f6cceef77b" />
          <p align="center">REST API</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="https://www.builder.io/c/docs/getting-started">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fb739b409e5b94937b5b11e3cf62cfae4" />
          <p align="center">GraphQL</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="https://www.builder.io/c/docs/getting-started">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0f577e84eb4e4aa4a69d602dd376aa11" />
          <p align="center">Shopify</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="https://www.builder.io/c/docs/import-from-figma">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ffb77e93c28e044178e4694cc939bf4cf" />
          <p align="center">Figma</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="https://www.builder.io/c/docs/getting-started">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2f3409f4f8b64d5f880195061aa481ab" />
          <p align="center">React</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="examples/next-js">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc6a3c58c0bde4f43b1fd6a350f491bdf" />
          <p align="center">Next.js</p>
        </a>
      </td>
    </tr>
    <tr>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="examples/gatsby">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F45e59fc603574e708dcb79e45ef72d02" />
          <p align="center">Gatsby</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="packages/vue">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7cc6d5b6fc4045d5a9f9b12ddcc65407" />
          <p align="center">Vue</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="examples/nuxt">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F73f47f47e0cc46cd95dbf72c26728858" />
          <p align="center">Nuxt</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="packages/angular">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa91e9e437203442d8ed481eef94a99dc" />
          <p align="center">Angular</p>
        </a>
      </td>
      <td width="100px" align="center" valign="middle">
        <a  target="_blank" href="packages/angular">
          <img height="50" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F5613cb3536be4c108b32c34bf06f1c59" />
          <p align="center">Webcomponents</p>
        </a>
      </td>
      <td></td>
    </tr>

  </tbody>
</table>

Don't see an integration you're looking for? Our [HTML API](https://www.builder.io/c/docs/getting-started), [Content APIs](https://www.builder.io/c/docs/query-api), and [GraphQL APIs](https://www.builder.io/c/docs/graphql-api) works for all tech stacks and frameworks.

## What's in this repository?

This repo houses all of the various [SDKs](packages), [usage examples](examples), [starter projects](starters), and [plugins](plugins).

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
// You can use the url="..." prop to automatically fetch the content for that URL,
// or omit this prop and Builder.io will fetch the corresponding page for the current
// location.pathname, if available
<Route path="/something" render={() => <BuilderComponent model="page" url="/something" />}>
```

Create a new page with url "/something" in Builder and change the [preview URL](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4670438a077f497d8a486f890201ae85) to localhost:port/something (e.g. localhost:8888/something if your dev server is on port 8888) and edit!

See more info on setting up your [preview urls](https://www.builder.io/c/docs/guides/preview-url) here.

Also, see the full [React API here](https://github.com/BuilderIO/builder/blob/master/packages/react/README.md)

### Using your components

See this [design systems example](/examples/react-design-system) for lots of examples using your design system + custom components + storybook

> 👉**Tip: want to limit page building to only your components? Try [components only mode](https://builder.io/c/docs/guides/components-only-mode)**

Register a component

```tsx
import { Builder } from '@builder.io/react';

const SimpleText = props => <h1>{props.text}</h1>;

Builder.registerComponent(SimpleText, {
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'text' }],
});
```

Then back at your page

```tsx
import './simple-text'

// ...

<Route path="/something" render={() => <BuilderComponent model="page" url="/something">}>
```

Open the dashboard and use it!

See our [docs site](https://builder.io/c/docs/custom-react-components) for additional help and information, or contact us if you run into any issues or questions!

For lots of examples of using React components in Builder, see the source for our built-in Builder blocks [here](https://github.com/BuilderIO/builder/tree/master/packages/react/src/blocks) and widgets [here](https://github.com/BuilderIO/builder/tree/master/packages/widgets/src/components)

### Dynamic landing pages

👉**Tip:** see our guides for **[Next.js](examples/next-js)** and **[Gatsby](examples/gatsby)** for best support for those frameworks

One of Builder's most powerful features is allowing the creation of new pages for you. See a simple example of how to do this with react-router below:

```tsx
import { BuilderComponent, builder } from '@builder.io/react'

builder.init('YOUR_KEY')

export default let CatchAllPage = () => {
  const [pageJson, setPage] = useState()

  useEffect(() => {
    builder.get('page', { url: location.pathname })
       // The value will be `null` if no page was found
      .promise().then(setPage)
  , [])

  return pageJson === undefined
    ? <Loading />
    : pageJson
    ? <BuilderComponent model="page" content={pageJson} />
    : <NotFound />
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

## Don't use React?

Check out our [quick start guide](https://www.builder.io/c/docs/getting-started) for options for many frameworks, including our [HTML API](https://builder.io/c/docs/getting-started) that works for any site

```javascript
let page = await request(
  `https://cdn.builder.io/api/v1/html/page?url=${PAGE_URL}&apiKey=${YOUR_KEY}`
);
if (page) {
  let html = page.data.html;
  // Put the html in your page template between your header and footer and you are done!
}
```

✨**Tip:** You can make reusable components for your Builder.io pages using [symbols](https://builder.io/c/docs/guides/symbols)

### Structuring your site

There are a lot of ways you can use Builder for your site. Some of the main questions you'll want to ask yourselves - what on your site should be in your code vs in Builder.

As a general rule, parts of your site that should be managed by non developers should probably be in Builder. Parts that are complex with a lot of code, should probably be in your codebase. Using [custom components](https://www.builder.io/c/docs/custom-react-components) in your Builder content can help you strike a good balance here as well

Here are some examples we recommend for how to structure various pages on your site, for instance for a headless commerce site:

![examples on how to structure your site](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc811a87f916f4e37990b1afc9df25721)

### Data models, components, SEO, and more

<img src="https://cdn.builder.io/api/v1/image/assets%2F444142b2cae54a19aeb8b5ba245feffe%2F8c2699f47fea48b296b43dbb422336e8" />

Builder.io gives you a ton more power and control than just page building. Check our guides on

- [Custom models](https://builder.io/c/docs/guides/getting-started-with-models)
- [Custom design systems in Builder.io](https://github.com/BuilderIO/builder/tree/master/examples/react-design-system)
- [SEO optimizing Builder.io content](https://builder.io/c/docs/seo)
- [Custom React components in the visual editor](https://www.builder.io/c/docs/custom-react-components)
- [Components only mode](https://www.builder.io/c/docs/guides/components-only-mode)

Additional framework support:

- [Gatsby](https://github.com/BuilderIO/builder/tree/master/examples/gatsby)
- [Next.js](https://github.com/BuilderIO/builder/tree/master/examples/next-js)
- [Angular](https://github.com/BuilderIO/builder/tree/master/packages/angular)
- [HTML API (for any framework)](https://builder.io/c/docs/html-api)

As well as some handy power features like:

- [Symbols](https://builder.io/c/docs/guides/symbols)
- [Dynamic data fetching and binding](https://builder.io/c/docs/guides/advanced-data)
- [State handling](https://builder.io/c/docs/guides/state-and-actions)
- [Content API](https://builder.io/c/docs/query-api)
- [GraphQL API](https://builder.io/c/docs/graphql-api)
- [Webhooks](https://builder.io/c/docs/webhooks)
- [Targeting and scheduling content](https://builder.io/c/docs/guides/targeting-and-scheduling)
- [Extending Builder.io with plugins](https://github.com/BuilderIO/builder/tree/master/plugins)

## How the Builder.io platform works

![How it works](https://i.imgur.com/tAnTKeN.png)

## Code generation

Check out [JSX Lite](https://github.com/builderio/jsx-lite) to dep dive into how our codegen works and try it yourself!

<p align="center">
  <img width="600" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F3c0dc574aa8c4b06adff6f91e01cda3d" />
</p>

![Codegen GIF](https://imgur.com/H1WTtGe.gif)

## We're hiring!

Want to work on the future of visual software development? Email me at steve@builder.io and let's talk

## Join the community!

Questions? Requests? Feedback? Chat with us in our [official forum](https://forum.builder.io)!

## Troubleshooting and feedback

Problems? Requests? Open an [issue](https://github.com/BuilderIO/builder/issues). We always want to hear feedback and interesting new use cases and are happy to help.
