import React from 'react';
import { graphql } from 'gatsby';
import { BuilderComponent } from '@builder.io/react';

/**
 * Example of rendering a page with Builder.io content and other content.
 * E.g. a custom component model in Builder called "header"
 */
export default class ExamplePagePage extends React.Component<any> {
  render() {
    const { header } = this.props.data;
    return (
      <div>
        <BuilderComponent name="header" content={header.everything} />
      </div>
    );
  }
}

export const pageQuery = graphql`
  query {
    header(limit: 1) {
      everything
    }
  }
`;
