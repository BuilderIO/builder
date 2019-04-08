import React from 'react'
import { Builder, builder, BuilderComponent } from '@builder.io/react'
// Allow interactive widgets in the editor (importing registers the react components)
import '@builder.io/widgets';
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
        <div>
          {this.props.builderPage ? (
            <BuilderComponent name="page" content={this.props.builderPage} />
          ) : (
            'Error!'
          )}
        </div>
      </div>
    )
  }
}

export default CatchallPage
