import * as React from 'react';
import { BuilderComponent } from '@builder.io/react';
import '@builder.io/widgets';
import '../components/code-block';
import '../components/animated-logo';
import '../components/material-table';
import '../components/tooltip';
import Layout from '../layouts/layout';

interface PageTemplateProps {
  pageContext: any;
}

const PageTemplate: React.SFC<PageTemplateProps> = ({ pageContext }) => (
  <Layout>
    <BuilderComponent content={pageContext.builder.content} />
  </Layout>
);

export default PageTemplate;
