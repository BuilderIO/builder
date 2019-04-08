# Builder example with Next.js

## Getting started


### To install

```npm install --save @builder.io/react @builder.io/widgets```

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

## Dynamic landing pages

Since next.js doesn't natively support dynamic pages, we have a couple of options.

A basic setup would be to override _error.js to use that as a catchall page, and handle accordingly:

```js
import React from 'react'
import { Builder, builder, BuilderComponent } from '@builder.io/react'
// Allow interactive widgets in the editor (importing registers the react components)
import '@buidler.io/widgets';
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

Alternatively, you can add some custom behavior in your server.js, that behaves similar to previous example - if a URL is not found in your next.js routes, check for a Builder page at that URL, and if found render similar to above
