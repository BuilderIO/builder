// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { useEffect, useState } from 'react';

function App() {
  const [props, setProps] = useState<any>(undefined);

  useEffect(() => {
    getProps().then((resp) => {
      setProps(resp);
    });
  }, []);

  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
}

export default App;
