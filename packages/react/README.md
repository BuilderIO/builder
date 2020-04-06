# Builder.io React SDK

See our [main readme](/README.md) for info on getting starte with the React SDK

Also see our examples of using reacth with a [design system](/examples/react-design-system) or a [simple example](/examples/react) and how to use your [react components](https://github.com/BuilderIO/builder#using-your-components) in the visual editor!

Also see our docs for [next.js](/examples/next-js) and [gatsby](/examples/gatsby)

## React API

### BuilderComponent

#### Simple example

```tsx
// Render a matching Builder page for the given URl
<BuilderComponent model="page">
```

See our guides for [Gatsby](https://github.com/BuilderIO/builder/tree/master/examples/gatsby) and [Next.js](https://github.com/BuilderIO/builder/tree/master/examples/next-js) for guides on using with those frameworks

#### Passing content manually

This is useful for doing server side rendering, e.g. with [Gatsby](https://github.com/BuilderIO/builder/tree/master/examples/gatsby) and [Next.js](https://github.com/BuilderIO/builder/tree/master/examples/next-js) or via
loading data from other sources than our default APIs, such as data in your own database saved via [webhooks](https://www.builder.io/c/docs/webhooks)

```ts
const content = await builder.get('page', { ...options });
if (content) {
  document.title = content.data.title; // You can use custom fields from the response
  return <BuilderComponent model="page" content={content} >
}

```

#### Passing data and functions down

You can also pass [data](https://www.builder.io/c/docs/guides/connecting-api-data) and [functions](https://www.builder.io/c/docs/react/custom-actions) down to the Builder component to use in the UIs (e.g. bind 
data values to UIs e.g. for text values or iterating over lists, and actions to trigger for instance on click of a button)

```tsx
<BuilderComponent 
  model="page" 
  data={{
    products: productsList,
    myFunction: () => alert('Triggered!'),
    foo: 'bar'
  }} >
```

Everything passed down is available on the `state` object in data and actions - e.g. `state.products[0].name` or `state.myFunction()`

See more about using data passed down [here](https://www.builder.io/c/docs/react/custom-actions)

#### Advanced querying

When using custom [models](https://www.builder.io/c/docs/guides/getting-started-with-models) and [fields](https://www.builder.io/c/docs/custom-fields) you can do more advanced filtering of your content with [queries]((https://www.builder.io/c/docs/custom-fields))
and [targeting](https://www.builder.io/c/docs/guides/targeting-and-scheduling)

```tsx
import { BuilderComponent, builder } from '@builder.io/react';

builder.setUserAttributes({ isLoggedIn: false })

export default () => <div>
  <BuilderComponent 
     model="section" 
     options={{ query: { 'data.something.$in': ['value a', 'value b'] } }} />
  <!-- some other content -->
</div>
```

#### contentLoaded

The contentLoaded hook can be useful for when you add [custom fields](https://www.builder.io/c/docs/custom-fields)

```tsx
<BuilderComponent 
  model="page" 
  contentLoaded={data => {
    document.title = data.title // E.g. if your custom field is called `title`
  }}
/>
```

### Builder

The global `Builder` singleton has a number of uses. Most important is registing custom components.

```tsx
import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Builder } from '@builder.io/react';

class CodeBlockComponent extends React.Component {
  render() {
    return (
      <SyntaxHighlighter language={this.props.language}>
        {this.props.code}
      </SyntaxHighlighter>
    );
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
})
```

See our full guide on [registering custom components here](https://www.builder.io/c/docs/custom-react-components)

### builder

The React SDK exports the core SDK's [builder object](../core), which can be used for settings like 
your API key and user attributes

```tsx
import { builder } from '@builder.io/react'

builder.init(YOUR_KEY)

// Optional custom targeting
builder.setUserAttributes({
  userIsLoggedIn: true,
  whateverKey: 'whatever value'
})
```
