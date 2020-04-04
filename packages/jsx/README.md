# Builder.io JSX support (alpha)

A TypeScript custom transformer which enables you to use JSX with Builder.io

<img src="https://i.imgur.com/KTpBDvH.gif" >

## Why

1. Write JSX code _one time_ that can **compile and render to any language or framework** using [Builder.io's various SDKs](../packages) or custom targets
2. **Edit the JSX code visually** using Builder.io's editor and write code / use your own coding tools _side by side_

## Example

```tsx
<>
  <div css={{ display: 'flex', flexDirection: 'column' }}>
    <h1>{state.title}</h1>
    <p>Hello there!</p>
    <Button onClick={event => state.title = 'Clicked!'}>Click me!</Button>
  </div>
</>
```

Can be previewed and edited in the Builder.io visual editor, as well as run and render natively to any supported framework

## Usage examples

Kitchen sync showing several things you can do with this combined with other Builder.io packages and/or APIs

```tsx
import { buidlerToJsx, jsxToBuilder } from '@builder.io/jsx';
import { BuilderComponent, codeGen } from '@builder.io/react';
import { contentToLiquid } from '@builder.io/shopify';

// Get Builder.io JSON from JSX 
const json = jsxToBuilder(`
  <>
    <div>Hello {state.name}!</div>
    <input value={state.name} onChange={e => state.name = e.target.value} />
  </>
`)

// Generate HTML with dynamic data
const html = renderToString(<BuilderComponent content={json} data={{ name: 'Steve' }} />)

// Generate liquid code for Shopify themes
const shopifyLiquidCode = contentToLiquid(json);

// Generate Builder.io JSX from Builder.io JSON
const jsx = builderToJsx(json);

// Create an entry in Builder.io CMS with this data
axios.post('https://builder.io/api/v1/write/page', { name: 'My new page', data: { blocks: json }})

// Get a current Builder.io page or entry as jsx
const jsxForBuilderPage = builderToJsx(await axios.get('https://cdn.builder.io/api/v2/content/page/123'))

// See https://github.com/BuilderIO/builder/tree/master/packages for up to date list of supported frameworks
// Docs coming soon on how to make a package to support your language or framework of choice too
const reactCode = codeGen(json)

// Render react dynamically with interactivity (state, actions, etc)
React.render(document.body, <BuilderComponent content={json} data={{ name: 'Steve' }} />)
```

You can also use Builder.io's [Rest APIs](https://www.builder.io/c/docs/query-api), [GraphQL](https://www.builder.io/c/docs/graphql-api), and [Write APIs](https://www.builder.io/c/docs/write-api) to sync Builder.io content (json) to/from Builder.io's CMS and visual editor

## Coming soon

- Stable (v1) release
- CLI for syncing JSX content to/from Builder.io's CMS
- Downloadable version of Builder.io's visual editor for visually editing Builder.io JSX locally
- Plugin API for custom syntaxes and extensions
