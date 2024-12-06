import { Builder, BuilderComponent, builder } from '@builder.io/react';
import { getAPIKey, getProps, PAGES } from '@sdk/tests';
import { useEffect, useState } from 'react';

import '@builder.io/widgets';

builder.init(getAPIKey());

// default to not tracking, and re-enable when appropriate
builder.canTrack = false;

function App() {
  const [props, setProps] = useState<any>(undefined);

  useEffect(() => {
    getProps({ sdk: 'oldReact' }).then(resp => {
      setProps(resp);
      if (
        window.location.pathname.includes('get-query') ||
        window.location.pathname.includes('get-content')
      ) {
        if (resp.apiEndpoint) {
          builder.apiEndpoint = resp.apiEndpoint;
          delete resp.apiEndpoint;
        }
        builder
          .get('', {
            ...resp,
            ...resp['options'],
          })
          .promise()
          .then();
      }
    });
  }, []);

  if (props?.apiVersion) {
    builder.apiVersion = props?.apiVersion;
  }

  if (props?.trustedHosts) {
    Builder.trustedHosts = props.trustedHosts;
  }

  // only enable tracking if we're not in the `/can-track-false` and `symbol-tracking` test route
  useEffect(() => {
    if (
      !window.location.pathname.includes('can-track-false') &&
      !window.location.pathname.includes('symbol-tracking')
    ) {
      builder.canTrack = true;
    }
  }, []);

  return props || PAGES[window.location.pathname]?.isGen1VisualEditingTest ? (
    <BuilderComponent {...props} />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
