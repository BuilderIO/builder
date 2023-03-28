// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/react/src/index';

function App() {
  const props = { ...getProps(), customComponents: getCustomComponents() };
  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
}

export default App;
