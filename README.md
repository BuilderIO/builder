<br /><br />
<p align="center"><img width="502" height="125" src="https://imgur.com/B9CUJxo.gif" alt="Builder logo" /></p>
<h2 align="center">Drag and drop page building for any website.</h2> 
<p align="center">Design with your React components, publish remotely</p>
<br />
<br />
<p align="center"><img src="https://imgur.com/lHDo3Mq.gif" alt="Editor example" /></p>

<br /><br /><br />

## What is it good for?

- Landing pages
- Documentation
- Blogging
- Marketing pages (homepage, etc)
- Content pages (about, FAQ, etc)
- Optimization (ab test pages)
- Marketing teams that never stop asking for changes
- Developers who are tired of pushing pixels


## Getting Started

```sh
npm install --save @builder.io/react
```

Create a free account at [builder.io](https://builder.io) and grab your [API key](https://builder.io/account/organization)

```ts
import { builder, BuilderComponent } from '@builder.io/react'

builder.init(YOUR_KEY)
```

Then in your router
```tsx
<Route path="/something" render={() => <BuilderComponent model="page" />}>
```

Create a new page and open your-dev-url:port/something and edit

[gif]

### Using your components

Wrap a component

```tsx
import { BuilderBlock } from '@builder.io/react'

@BuilderBlock({
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }]
})
export class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>
  }
}
```

Then back at your page

```tsx
import './simple-page'

// ...

<Route path="/something" render={() => <BuilderComponent model="page">}>
```

Open the dashboard and use it

[gif]

More docs on builder APIs and such at [builder.io/c/docs](https://builder.io/c/docs)

For Builder decorator support you need to be using typescript or babel with legacy decorators.
Alternatively you can use the alternative syntax:

```tsx
import { builderBlocks } from '@builder.io/react'

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>
  }
}

builderBlocks.add(SimpleText, {
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }]
})
```



## Troubleshooting and feedback

Problems? Requests? Open an issue. Always want feedback, interesting new use cases, happy to help.
