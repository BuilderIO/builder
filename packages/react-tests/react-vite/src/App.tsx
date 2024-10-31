import { Builder, BuilderComponent, builder } from '@builder.io/react';
import { VISUAL_EDITING_PATHNAMES, getAPIKey, getProps } from '@sdk/tests';
import { useEffect, useState } from 'react';

import '@builder.io/widgets';

builder.init(getAPIKey('real'));

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

  /**
   * - certain tests expect the content to only render after the first render
   * - the `/large-reactive-state-editing` requires the `BuilderComponent` to
   * be rendered immediately, so that the API request is made.
   */
  return props || VISUAL_EDITING_PATHNAMES.includes(window.location.pathname as any) ? (
    <BuilderComponent {...props} />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
