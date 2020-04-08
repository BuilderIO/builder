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

## Use cases

- **Platform universal code** - your same code compnents can run in a React app, or a Shopify store liquid template, a native app - you name it. 
    - E.g. want to make an open source library but can't choose what framework(s) to support? Write it once in Builder JSX and generate code for all frameworks (React, Vue, Native, Shopify, etc...)
- **Future proof your code** - tired of writing the same UI components for every hot new framework as it comes out? Tried of duplicating components because you need to support multiple frameworks? 
    - Write once and generate. New hot fraemework comes out? Write an adapter once and now all your current code supports the new framework
- **Edit visually** - visually edit all code using Builder.io. Share with designers or marketers to create, repurpose, and extend either as code or in a headless CMS such as Builder.io

## Usage examples

Kitchen sink showing several things you can do with this combined with other Builder.io packages and/or APIs

```tsx
import { buidlerToJsx, jsxToBuilder } from '@builder.io/jsx';
import { BuilderComponent } from '@builder.io/react';
import { toReactCode } from '@builder.io/codegen';
import { contentToLiquid } from '@builder.io/shopify';

// Get Builder.io JSON from JSX 
const json = jsxToBuilder(`
  <>
    <div>Hello {state.name}!</div>
    <input value={state.name} onChange={e => state.name = e.target.value} />
  </>
`)

// Generate HTML with dynamic data
import { renderToString } from 'react-dom/server';
const html = renderToString(<BuilderComponent content={json} data={{ name: 'Steve' }} />)

// Generate liquid code for Shopify themes
const shopifyLiquidCode = contentToLiquid(json);

// Generate Builder.io JSX from Builder.io JSON
const jsx = builderToJsx(json);

// Create an entry in Builder.io CMS with this data
axios.post('https://builder.io/api/v1/write/page', { name: 'My new page', data: { blocks: json }}, { headers: { Authorization: `Bearer ${YOUR_PRIVATE_KEY}` }})

// Get a current Builder.io page or entry as jsx
const jsxForBuilderPage = builderToJsx(await axios.get('https://cdn.builder.io/api/v2/content/page/123?apiKey=YOUR_PUBLIC_KEY'))

// See https://github.com/BuilderIO/builder/tree/master/packages for up to date list of supported frameworks
// Docs coming soon on how to make a package to support your language or framework of choice too
const reactCode = toReactCode(json)

// Render react dynamically with interactivity (state, actions, etc)
React.render(document.body, <BuilderComponent content={json} data={{ name: 'Steve' }} />)
```

You can also use Builder.io's [Rest APIs](https://www.builder.io/c/docs/query-api), [GraphQL](https://www.builder.io/c/docs/graphql-api), and [Write APIs](https://www.builder.io/c/docs/write-api) to sync Builder.io content (json) to/from Builder.io's CMS and visual editor

## Coming soon

- Stable (v1) release
- CLI for syncing JSX content to/from Builder.io's CMS
- Downloadable version of Builder.io's visual editor for visually editing Builder.io JSX locally
- Plugin API for custom syntaxes and extensions
