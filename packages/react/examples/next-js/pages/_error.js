import React from 'react'
import { Builder, builder } from '@builder.io/react'
// Allow interactive widgets in the editor (importing registers the react components)
import '@buidler.io/widgets';

const BUILDER_API_KEY = require('../keys/builder.json').apiKey;
if (Builder.isBrowser) {
  builder.init(BUILDER_API_KEY)
}

class CatchallPage extends React.Component {
  static async getInitialProps({ res, req }) {
    // On the client we can use the same `builder` instance, on the server though
    // we need a fresh one per request
    const builderInstance = res ? new Builder(BUILDER_API_KEY, req, res) : builder

    const page = await builderInstance.get('page').toPromise()

    if (res && res.statusCode === 404 && page) {
      res.statusCode = 200
    }
    return { builderPage: page }
  }

  render() {
    return (
      <p>
        {this.props.builderPage ? (
          <BuilderComponent name="page" content={this.props.builderPage} />
        ) : (
          'Error!'
        )}
      </p>
    )
  }
}

export default CatchallPage
