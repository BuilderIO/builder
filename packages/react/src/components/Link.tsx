import React from 'react';
import { BuilderStoreContext } from '../store/builder-store';
/**
 * Link component should be used instead of an anchor tag in our components,
 * this is to allow our users to override anchor tags in
 * case they're using a routing Lib that requires using their
 * custom Link component (e.g Next, Gatsby, React Router)
 * <BuilderComponent renderLink=(props) => <myCustomLink {...props} /> />
 */
export const Link: React.SFC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = props => (
  <BuilderStoreContext.Consumer>
    {context => {
      if (context.renderLink) {
        return context.renderLink(props);
      }
      return <a {...props} />;
    }}
  </BuilderStoreContext.Consumer>
);
