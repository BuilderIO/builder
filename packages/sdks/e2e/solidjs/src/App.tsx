import type { Component } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-solid';
import { getContentForPathname } from '@builder.io/sdks-e2e-tests';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

const App: Component = () => {
  const content = getContentForPathname();

  return content ? (
    <RenderContent
      content={content}
      model="page"
      apiKey={BUILDER_PUBLIC_API_KEY}
    />
  ) : (
    <div>Content Not Found</div>
  );
};

export default App;
