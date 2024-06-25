import { BuilderComponent, builder } from '@builder.io/react';
import { getAPIKey, getProps } from '@sdk/tests';
import { useEffect, useState } from 'react';

import '@builder.io/widgets';

builder.init(getAPIKey());
// default to not tracking, and re-enable when appropriate
builder.canTrack = false;

function App() {
  const [props, setProps] = useState<any>(undefined);

  useEffect(() => {
    getProps({}).then(resp => {
      setProps(resp);
    });
  }, []);

  if (props?.apiVersion) {
    builder.apiVersion = props?.apiVersion;
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

  // issues with react types incompatibility (v16 vs v17 vs v18?)
  // @ts-ignore
  return props ? <BuilderComponent {...props} /> : <div>Content Not Found</div>;
}

export default App;
