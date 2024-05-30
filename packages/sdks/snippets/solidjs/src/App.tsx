/**
 * Quickstart snippet
 * snippets/solidjs/src/App.tsx
 */
import {
  Content,
  fetchOneEntry,
  type BuilderContent,
} from '@builder.io/sdk-solid';
import { createEffect, createSignal } from 'solid-js';

const BUILDER_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

function App() {
  const [content, setContent] = createSignal<BuilderContent | null>(null);

  createEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then((data: any) => {
      setContent(data);
    });
  });

  return (
    <>
      {content() ? (
        <Content content={content()} apiKey={BUILDER_API_KEY} model="page" />
      ) : (
        <div>Not found</div>
      )}
    </>
  );
}

export default App;
