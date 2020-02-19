import React from 'react';
import Helmet from 'react-helmet';
import CssBaseline from '@material-ui/core/CssBaseline';

const Layout: React.FC = ({ children }) => (
  <>
    <div>
      <Helmet>
        <title>Builder: Drag and Drop Page Building for Any Site</title>
        <meta
          property="og:image"
          content="https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2F298de8e1b2294a5180ac2eeadda5ee75?v=1"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://builder.io" />
        <meta
          property="og:title"
          content="Builder: Drag and drop page building for any site"
        />
        <meta
          property="og:description"
          content="Builder is the first and only headless CMS with full visual drag and drop editing"
        />

        <meta
          name="description"
          content="Builder is the first and only headless CMS with full visual drag and drop editing"
        />
      </Helmet>
      <CssBaseline />
      {children}
    </div>
  </>
);

export default Layout;
