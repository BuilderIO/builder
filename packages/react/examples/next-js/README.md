# Builder example with Next.js

## Getting started

To run the example code, cd into `examples/next-js` and run
```npm run dev```

Or to add to your own code:

```npm install --save @builder.io/react @builder.io/widgets```

## The gist of the setup

Since next.js doesn't support catchall routes, we override `_error.js` to check for a Builder
page any time a matching route isn't found in Next.js


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
