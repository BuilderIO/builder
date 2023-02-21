import { getAPIKey, getProps } from '@builder.io/sdks-e2e-tests';
import { BuilderComponent, builder } from '@builder.io/react';
import { useEffect } from 'react';

builder.init(getAPIKey());
// default to not tracking, and re-enable when appropriate
builder.canTrack = false;

function App() {
  const props = getProps();

  // only enable tracking if we're not in the `/can-track-false` test route
  useEffect(() => {
    if (!window.location.pathname.includes('can-track-false')) {
      builder.canTrack = true;
    }
  }, []);

  return props ? <BuilderComponent {...props} /> : <div>Content Not Found</div>;
}

export default App;
