/* eslint-disable react/prop-types */
import * as React from 'react';
import { graphql } from 'gatsby';
import { BuilderComponent, builder } from '@builder.io/react';
import { Helmet } from 'react-helmet';
import '@builder.io/widgets';
import Hero from '/src/components/Hero/Hero.jsx';
import '/src/components/Hero/Hero.builder.js';
/**
 * Hero is an example of a custom component that you can use in the builder.io editor
 * https://www.builder.io/c/docs/custom-react-components
 */

// TODO: enter your public API key
builder.init('jdGaMusrVpYgdcAnAtgn');

const PageTemplate = ({ data }) => {
  const content = data.allBuilderModels.page[0]?.content;
  return (
    <>
      <Helmet>
        <title>{content?.data.title}</title>
      </Helmet>
      <header></header>

      <BuilderComponent content={content} model="page" />
      <footer>
        <p>A Builder.io starter with Gatsby</p>
      </footer>
    </>
  );
};

export default PageTemplate;
export const pageQuery = graphql`
  query ($path: String!) {
    allBuilderModels {
      page(target: { urlPath: $path }, limit: 1, options: { cachebust: true }) {
        content
      }
    }
  }
`;
