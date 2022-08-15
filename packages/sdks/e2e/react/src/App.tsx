// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-react';
import { CONTENTS } from '@builder.io/sdks-e2e-tests/specs';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

function App() {
  function getContent() {
    switch (window.location.pathname) {
      case '/':
        return CONTENTS.HOME;
      case '/columns':
        return CONTENTS.COLUMNS;
      default:
        return null;
    }
  }

  const content = getContent();
  return content ? (
    <RenderContent
      content={content}
      model="page"
      apiKey={BUILDER_PUBLIC_API_KEY}
    />
  ) : (
    <div>Content Not Found</div>
  );
}

export default App;
