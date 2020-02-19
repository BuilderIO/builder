import * as React from 'react';
import { BuilderComponent } from '@builder.io/react';
import '../components/CodeBlock';

interface PageTemplateProps {
  pageContext: any;
}

const PageTemplate: React.SFC<PageTemplateProps> = ({ pageContext }) => (
  <BuilderComponent content={pageContext.builder.content} />
);

export default PageTemplate;
