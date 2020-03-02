import * as React from 'react';
import { BuilderComponent } from '@builder.io/react';
import '@builder.io/widgets';
/**
 * CodeBlock is an example of a custom component that you can use in the builder.io editor
 * https://www.builder.io/c/docs/custom-react-components
 */
import '../components/Hero/Hero.builder'


interface PageTemplateProps {
  pageContext: any;
}

const PageTemplate: React.SFC<PageTemplateProps> = ({ pageContext }) => (
  <BuilderComponent content={pageContext.builder.content} />
);

export default PageTemplate;
