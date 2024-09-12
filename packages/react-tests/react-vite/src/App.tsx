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
    getProps({ sdk: 'oldReact' }).then(resp => {
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

  /**
   * - certain tests expect the content to only render after the first render
   * - the `/large-reactive-state-editing` requires the `BuilderComponent` to
   * be rendered immediately, so that the API request is made.
   */
  // issues with react types incompatibility (v16 vs v17 vs v18?)
  // @ts-ignore
  return props || window.location.pathname.includes('/large-reactive-state-editing') ? (
    <BuilderComponent {...props} />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
