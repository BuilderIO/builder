# Builder.io React SDK

## Integration

See our full [getting started docs](https://www.builder.io/c/docs/developers), or jump right into integration. We generally recommend to start with page buliding as your initial integration:

<table>
  <tr>
    <td align="center">Integrate Page Building</td>
    <td align="center">Integrate Section Building</td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrating-builder-pages">
        <img alt="CTA to integrate page buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F48bbb0ef5efb4d19a95a3f09f83c98f0" />
      </a>
    </td>
    <td align="center">
      <a href="https://www.builder.io/c/docs/integrate-section-building">
        <img alt="CTA to integrate section buliding" src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F9db93cd1a29443fca7b67c1f9f458356" />
      </a>
    </td>    
  </tr>
</table>

## React API

### Simple example

The gist of using Builder, is fetching content (using queries on [custom fields](https://www.builder.io/c/docs/custom-fields) and [targeting](https://www.builder.io/c/docs/targeting-with-builder). Builder is structured like a traditional headless CMS where you can have different content types, called [models](https://www.builder.io/c/docs/guides/getting-started-with-models). By default, every Builder space has a `"page"` model.

```tsx
import { builder } from '@builder.io/react'

const API_KEY = '...' // Your Builder public API key
const MODEL_NAME = 'page';

const content = await builder
  .get(MODEL_NAME, {
    // Optional custom query
    query: {
      'data.customField.$gt': 100,
    },
    // Optional custom targeting
    userAttributes: {
      urlPath: '/' // Most Builder content is targeted at least by the URL path
    }
  })
  .promise()
  
// Later, pass the fetched content to the BuilderComponent
<BuilderComponent model={MODEL_NAME} content={content} />
```

The builder content is simply json that you pass to a `<BuilderComponent />` to render. [Learn more about it here](https://www.builder.io/c/docs/how-builder-works-technical)

You can view all of the options for `builder.get` for fetching content [in our full reference here](../core/docs/interfaces/GetContentOptions.md)

For example, with Next.js, to render Builder as your homepage:

```tsx
export const getStaticProps = async () => {
  return {
    props: {
      builderContent: await builder.get('page', {
        userAttributes: {
          urlPath: '/' // Fetch content targeted to the homepage ("/" url)
        }
      }).promise()
    }
  }
}

export default function MyHomePage({ builderContent }) {
  return <>
    <YourHeader />
    <BuilderComponent model="page" content={builderContent} />
    <YourFooter />
  </>
}
```

You can also allow dynamic page building (the ability to create new pages on new URLs dynamically). E.g. see [this guide](https://www.builder.io/c/docs/integrating-builder-pages) on how to do that

### Registering Components

One of Builder's most powerful features is registering your own components for use in the drag and drop editor. 
You can choose to have these compliment the built-in components, or to be the only components allowed to be used
(e.g. via [components-only mode](https://www.builder.io/c/docs/guides/components-only-mode))

```tsx
import { Builder } from '@builder.io/sdk-react';

function MyHero(props) { /* Your own hero component in your codebase */ }

Builder.registerComponent(MyHero, {
  name: 'Hero',
  inputs: [
    { name: 'title', type: 'string' } // Gets passed as the `title` prop to the Hero
  ]
})
```

Learn more about [registering components in Builder](https://www.builder.io/c/docs/custom-react-components)

### BuilderComponent

You can find the full [reference docs for the BuilderComponent props here](docs/interfaces/builder_component_component.BuilderComponentProps.md)

```tsx
const MODEL_NAME = 'page';

// Render 
<BuilderComponent model={MODEL_NAME} content={builderJson} />
```

See our guides for [Gatsby](https://github.com/BuilderIO/builder/tree/master/examples/gatsby) and [Next.js](https://github.com/BuilderIO/builder/tree/master/examples/next-js) for guides on using with those frameworks


#### Passing data and functions down

You can also pass [data](https://www.builder.io/c/docs/guides/connecting-api-data) and [functions](https://www.builder.io/c/docs/react/custom-actions) down to the Builder component to use in the UIs (e.g. bind
data values to UIs e.g. for text values or iterating over lists, and actions to trigger for instance on click of a button)

All data passed down is available in Builder [actions and bindings](https://www.builder.io/c/docs/guides/custom-code) as `state.*`, for instance in the below example `state.products`, etc will be available

```tsx
<BuilderComponent
  model="page"
  data={{
    products: productsList,
    foo: 'bar'
  }} 
  content={builderJson} />
```

You can also pass down functions, complex data like custom objects and libraries you can use `context`. Similar to React context, context passes all the way down (e.g. through symbols, etc). This data is not observed for changes and mutations

```tsx
<BuilderComponent
  model="page"
  context={{
    addToCart: () => myService.addToCart(currentProduct),
    lodash: lodash,
  }} 
  content={builderJson} />
```

Context is available in [actions and bindings](https://www.builder.io/c/docs/guides/custom-code) as `context.*`, such as `context.lodash` or `context.myFunction()` in the example above

#### Passing complex data

Everything passed down is available on the `state` object in data and actions - e.g. `state.products[0].name`

See more about using data passed down [here](https://www.builder.io/c/docs/react/custom-actions)

### Builder

The global `Builder` singleton has a number of uses. Most important is registering custom components.

```tsx
import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Builder } from '@builder.io/react';

class CodeBlockComponent extends React.Component {
  render() {
    return <SyntaxHighlighter language={this.props.language}>{this.props.code}</SyntaxHighlighter>;
  }
}

Builder.registerComponent(CodeBlockComponent, {
  name: 'Code Block',
  inputs: [
    {
      name: 'code',
      type: 'string',
      defaultValue: 'const incr = num => num + 1',
    },
    {
      name: 'language',
      type: 'string',
      defaultValue: 'javascript',
    },
  ],
});
```

See our full guide on [registering custom components here](https://www.builder.io/c/docs/custom-react-components).

See the [full reference docs for registerComponent options here](../core/docs/interfaces/Component.md).

### BuilderContent

#### Usage with Data Models

Although you can already fetch data models from our Content API directly and use it as you would any other API resource, with a BuilderContent component you are able to use live Editing / Previewing / [A/B testing](https://forum.builder.io/t/a-b-testing-data-models/158) of your Data Models within the Builder Visual Editor.

##### Example, setting up an editable theme:

```tsx
 <BuilderContent model="site-settings"> { (data, loading) => {
   If (loading) {
     return <Spinner />
   }
   return <>
      /*pass values down to an example ThemeProvider, used as a wrapper in your application*/     
       <ThemeProvider theme={data.theme} > 
           {props.children}
       </ThemeProvider>
   </>
   }}
</BuilderContent>
```

Or an example fetching server side and passing the content using the `content` prop, e.g. in Next.js

```tsx
export const getStaticProps = async () => {
  return {
    props: {
      builderDataContent: await builder.get('site-settings', /* other options like queries and targeting */).promise()
    }
  }
}

export default function MyPage({ builderDataContent }) {
  return <BuilderContent content={builderDataContent}>{data => 
    <ThemeProvider theme={data.theme}>
      {/* ... more content ... */}
    </ThemeProvider>
  </BuilderContent>
}
```


#### Usage with Page/Section Custom Fields

Page and section models in builder can be extended with [custom fields](https://www.builder.io/c/docs/custom-fields).   To enable live editing / previewing on components that uses those custom fields, you can use BuilderContent to pass input data from the model to your components that are outside the rendered content

##### Example, passing Custom Field input: 
```tsx
<BuilderContent model="landing-page">{ (data) => {
       /*use your data here within your custom component*/
        return <>
           <FeaturedImage image={data.featuredImage} />
           <BuilderComponent content={content} model="landing-page" />
       </>
   }}
</BuilderContent>
```

#### Passing content manually

This is useful for doing server side rendering, e.g. with [Gatsby](https://github.com/BuilderIO/builder/tree/master/examples/gatsby) and [Next.js](https://github.com/BuilderIO/builder/tree/master/examples/next-js) or via
loading data from other sources than our default APIs, such as data in your own database saved via [webhooks](https://www.builder.io/c/docs/webhooks)

```tsx
const content = await builder.get(‘your-data-model’, { ...options });
if (content) {
  /*use your data here*/
  return <BuilderContent model="your-data-model" content={content} >
}
```

#### Advanced querying
When using custom [models](https://www.builder.io/c/docs/guides/getting-started-with-models) and [fields](https://www.builder.io/c/docs/custom-fields) you can do more advanced filtering of your content with [queries](<(https://www.builder.io/c/docs/custom-fields)>)
and [targeting](https://www.builder.io/c/docs/guides/targeting-and-scheduling)

```tsx
import { BuilderContent, builder } from '@builder.io/react';

builder.setUserAttributes({ isLoggedIn: false })

export default () => <div>
  <BuilderContent
     model="your-data-model"
     options={{ query: { 'data.something.$in': ['value a', 'value b'] } }} />
  <!-- some other content -->
</div>
```

### builder

The React SDK exports the core SDK's [builder object](../core), which can be used for setting things like
your API key and user attributes

```tsx
import { builder } from '@builder.io/react';

builder.init(YOUR_KEY);

// Optional custom targeting
builder.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value',
});
```
