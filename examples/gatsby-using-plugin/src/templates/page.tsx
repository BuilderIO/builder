import * as React from 'react';
import { BuilderComponent } from '@builder.io/react';
import '@builder.io/widgets';
import '../components/code-block';
import '../components/animated-logo';
import '../components/material-table';
import '../components/tooltip';
import Layout from '../layouts/layout';
import { graphql } from 'gatsby';

interface PageTemplateProps {
  data: any;
}

const PageTemplate: React.SFC<PageTemplateProps> = props => (
  <Layout>
    <BuilderComponent
      content={props.data.allBuilderPages.docsHeader[0].everything}
    />
    <div className="Docs-wrapper" style={{ display: 'flex' }}>
      <BuilderComponent
        name="docs-nav"
        content={props.data.allBuilderPages.docsNav[0].everything}
      />
      <BuilderComponent
        name="docs-content"
        content={props.data.allBuilderPages.docsContent[0].everything}
      />
    </div>
  </Layout>
);

export default PageTemplate;

export const pageQuery = graphql`
  query($path: String!) {
    allBuilderPages {
      docsHeader(limit: 1) {
        everything
      }
      docsNav(limit: 1) {
        everything
      }
      docsContent(target: { urlPath: $path }, limit: 1) {
        everything
      }
    }
  }
`;
