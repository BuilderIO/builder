import React, { useState } from 'react';
import { NotFound } from '../components/NotFound';
import { BuilderComponent, useIsPreviewing } from '@builder.io/react';
import { CircularProgress } from '@material-ui/core';

// Match any page we don't have a hardcoded URL for and check
// Builder for a matching page. Otherwise show our 404 page
// For server side rendering see
//   Next.js: https://github.com/BuilderIO/builder/tree/main/packages/react/examples/next-js
//   Gatsby: https://github.com/BuilderIO/gatsby-starter-builder
export const CatchAll = () => {
  const [notFound, setNotFound] = useState(false);
  const isPreviewingInBuilder = useIsPreviewing();

  return (
    <>
      {!notFound ? (
        <BuilderComponent
          model="page"
          contentLoaded={content => {
            if (!content && !isPreviewingInBuilder) {
              setNotFound(true);
            }
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
            <CircularProgress color="inherit" disableShrink />
          </div>
        </BuilderComponent>
      ) : (
        <NotFound /> // Your 404 content
      )}
    </>
  );
};
