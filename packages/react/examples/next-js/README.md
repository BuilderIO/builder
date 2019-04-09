# Using Builder with Next.js

## Getting started

### Create an account

Frist things first, if you don't yet have one, create an account at [Builder.io](https://builder.io)

### To install

`npm install --save @builder.io/react @builder.io/widgets`

### Add the components and getInitialProps

To any page in next.js, you can fetch for a Builder page, and handle wether builder found a
match (or possibly not).

For instance, if you know you want /about to be a Builder page, create a Builder page with url /about
and use the following for `pages/about.js`

```js
import React from 'react'
import { Builder, builder, BuilderComponent } from '@builder.io/react'
// Allow interactive widgets in the editor (importing registers the react components)
import '@buidler.io/widgets';

const BUILDER_API_KEY = require('../keys/builder.json').apiKey
if (Builder.isBrowser) {
  builder.init(BUILDER_API_KEY)
}

class About extends React.Component {
  static async getInitialProps({ res, req }) {
    // On the client we can use the same `builder` instance, on the server though
    // we need a fresh one per request
    const builderInstance = res ? new Builder(BUILDER_API_KEY, req, res) : builder

    // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
    const page = await builderInstance.get('page').toPromise()
    return { builderPage: page }
  }

  render() {
    return (
      <div>
        {this.props.builderPage ? (
          <BuilderComponent name="page" content={this.props.builderPage} />
        ) : (
          /* Show something else */
        )}
      </div>
    )
  }
}
```

### Add the URL to your builder model and get editing

Next, when you have added the Builder page component on your local site, go to the [models](https://buidler.io/models) page in Builder, choose the "page" model, and give it a URL where it can find this React component for the "preview url" field. This may be, for example, `http://localhost:8888/my-page`

<img src="https://i.imgur.com/PRWvNM1.gif">

Now go to the [content](https://buidler.io/content) page, choose "+ new entry", and create a new page. This will open up that preview URL you previously gave and let you use the visual editor.

<img src="https://imgur.com/5BC0lYR.gif">

Also, once this is all working as expected and deployed, make sure to change the preview URL to one on your production site so anyone you acllow on your team can build and create pages!

Also, when done creating pages, be sure to hit "publish" to publish that content to be live!

### Troubleshooting

When creating a page in Builder, if Builder says "Builder code not found", that means Builder can't find the `<BuilderComponent />` in your React app. Try using your React devtools to ensure that component is in fact showing up. Even try hardcoding it temporarily to test that Builder can find it and you can use the visual editor on your site.

If anything else ever goes wrong for you, chat us anytime form the bottom right corner at [builder.io](https://builder.io) or email steve@builder.io. We are always happy to help!

## Dynamic landing pages

Since next.js doesn't natively support dynamic pages, we have a couple of options.

First, and perhaps most elegant, is to use [next-routes](https://github.com/fridays/next-routes)

### With react-routes

```js
// routes.js
module.exports = routes() // ----   ----      -----
  .add('**', 'builder')
```

```js
// pages/builder.js
import { Component } from 'react'
import { Builder, builder, BuilderComponent } from '@builder.io/react'
// Allow interactive widgets in the editor (importing registers the react components)
import '@buidler.io/widgets'
import Error from './_error'

const BUILDER_API_KEY = require('../keys/builder.json').apiKey
if (Builder.isBrowser) {
  builder.init(BUILDER_API_KEY)
}

class Builder extends Component {
  static async getInitialProps({ res }) {
    const builderInstance = res ? new Builder(BUILDER_API_KEY, req, res) : builder
    const page = await builderInstance.get('page').toPromise()
    if (!page && res) res.statusCode = 404
    return { data }
  }
  render() {
    const { page } = this.props
    if (!page) return <Error status={404} />
    return <BuilderComponent name="page" content={page} />
  }
}
```

### with pages/_error.js

A simplistic approach could also be to use \_error.js. Since \_error.js functions as catchall page, we can add our own handling:

```js
import React from 'react'
import { Builder, builder, BuilderComponent } from '@builder.io/react'
// Allow interactive widgets in the editor (importing registers the react components)
import '@buidler.io/widgets'
import Nav from '../components/nav'

const BUILDER_API_KEY = require('../keys/builder.json').apiKey
if (Builder.isBrowser) {
  builder.init(BUILDER_API_KEY)
}

class CatchallPage extends React.Component {
  static async getInitialProps({ res, req }) {
    // On the client we can use the same `builder` instance, on the server though
    // we need a fresh one per request
    const builderInstance = res ? new Builder(BUILDER_API_KEY, req, res) : builder

    // If there is a Builder page for this URL, this will be an object, otherwise it'll be null
    const page = await builderInstance.get('page').toPromise()

    if (res && res.statusCode === 404 && page) {
      res.statusCode = 200
    }
    return { builderPage: page }
  }

  render() {
    return (
      <div>
        <Nav />
        <p>
          {this.props.builderPage ? (
            <BuilderComponent name="page" content={this.props.builderPage} />
          ) : (
            'Error!'
          )}
        </p>
      </div>
    )
  }
}

export default CatchallPage
```

See `examples/next-js/pages/_error.js` for a real example you can run.

Alternatively, you can add some custom behavior in your `server.js`, that behaves similar to previous examples - if a URL is not found in your next.js routes, check for a Builder page with `await builder.get('page').toPromise()` at that URL, and if found render similar to above

## Using your React components in Builder pages

You can use your React components in the drag and drop editor in Builder. Simply wrap the component as shown below:

```js
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

And then be sure to import this component wherever you want it to be accessible in the editor

```js
import './simple-page'

// ...
;<BuilderComponent name="page" />
```

And then it will show up in the insert menu (under "show more") in the Builder editor!

For the `@BuilderBlock` decorator support you need to be using typescript or babel with legacy decorators. Alternatively you can use the alternative syntax:

```js
import { BuilderBlock } from '@builder.io/react'

class SimpleText extends React.Component {
  render() {
    return <h1>{this.props.text}</h1>
  }
}

BuilderBlock({
  name: 'Simple Text',
  inputs: [{ name: 'text', type: 'string' }]
})(SimpleText)
```
