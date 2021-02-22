import React from 'react';
import { graphql } from 'gatsby';
import { BuilderComponent, builder } from '@builder.io/react';

// TODO: enter your public API key
builder.init('jdGaMusrVpYgdcAnAtgn');

/**
 * Example of rendering a page with Builder.io content and other content.
 * E.g. a custom component model in Builder called "header"
 */
export default class ExamplePage extends React.Component<any> {
  render() {
    const { oneHeader, onePage } = this.props.data.allBuilderModels;
    return onePage ? (
      <div>
        {/* Optionally render a header from Builder.io, or render your <Header /> instead */}
        <BuilderComponent model="header" content={oneHeader?.content} />
        {/* Render other things in your code as you choose */}
        <BuilderComponent model="page" content={onePage.content} />
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
      oneHeader(options: { cachebust: true }) {
        content
      }
      # Manually grab the page content matching "/example"
      # For Gatsby content, we want to make sure to always get fresh (cachebusted) content
      onePage(
        target: { urlPath: "/example" }
        options: { cachebust: true, includeRefs: true }
      ) {
        content
      }
    }
  }
`;
