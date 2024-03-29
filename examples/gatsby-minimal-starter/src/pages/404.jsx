import * as React from 'react';
import { BuilderComponent, builder } from '@builder.io/react';
import '@builder.io/widgets';

// TODO: enter your public API key
builder.init('jdGaMusrVpYgdcAnAtgn');

const Dev404 = () => {
  const [notFound, setNotFound] = React.useState(false);
  return notFound ? (
    <NotFound /> // Your 404 content
  ) : (
    <BuilderComponent
      model="page"
      contentLoaded={content => {
        if (!content) {
          setNotFound(true);
        }
      }}
    >
      <div className="loading">No matching page generated, checking Builder.io ...</div>
    </BuilderComponent>
  );
};

const NotFound = () => <h1>No page found for this URL, did you publish it?</h1>;

export default Dev404;
