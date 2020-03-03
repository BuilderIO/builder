import React from 'react';
import { graphql } from 'gatsby';
import { BuilderComponent } from '@builder.io/react';

/**
 * Example of rendering a page with Builder.io content and other content.
 * E.g. a custom component model in Builder called "header"
 */
export default class ExamplePage extends React.Component<any> {
  render() {
    const { header, page } = this.props.data;
    return (
      <div>
        <BuilderComponent name="header" content={header[0].content} />
        {/* Render other things in your code as you choose */}
        <BuilderComponent name="page" content={page[0].content} />
      </div>
    );
  }
}

// See https://builder.io/c/docs/graphql-api for more info on our
// GraphQL API and our explorer
export const pageQuery = graphql`
  query {
    # example custom "header" component model, if you have one
    header(limit: 1) {
      content
    }
    # Manually grab the page content matching "/example"
    page(limit: 1, target: { urlPath: "/example" }) {
      content
    }
  }
`;
