import React from 'react';
import { graphql } from 'gatsby';
import { BuilderComponent, builder } from '@builder.io/react';

// TODO: enter your public API key
builder.init('jdGaMusrVpYgdcAnAtgn')

/**
 * Example of rendering a page with Builder.io content and other content.
 * E.g. a custom component model in Builder called "header"
 */
export default class ExamplePage extends React.Component<any> {
  render() {
    const { header, page } = this.props.data.allBuilderModels;
    return page[0] ? (
      <div>
        {/* Optionally render a header from Builder.io, or render your <Header /> instead */}
        <BuilderComponent name="header" content={header[0]?.content} />
        {/* Render other things in your code as you choose */}
        <BuilderComponent name="page" content={page[0]?.content} />
      </div>
    ) : (
      'Page not found for this URL'
    );
  }
}

// See https://builder.io/c/docs/graphql-api for more info on our
// GraphQL API and our explorer
export const query = graphql`
  query {
    allBuilderModels {
      # (optional) example custom "header" component model, if you have one
      header(limit: 1, options: { cacheBust: true }) {
        content
      }
      # Manually grab the page content matching "/example"
      # For Gatsby content, we want to make sure to always get fresh (cachebusted) content
      page(limit: 1, target: { urlPath: "/example" }, options: { cacheBust: true }) {
        content
      }
    }
  }
`;
