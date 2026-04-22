/**
 * Quickstart snippet
 * snippets/solidjs/src/App.tsx
 */
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-solid';
import { createEffect, createSignal } from 'solid-js';

const BUILDER_API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

function App() {
  const [content, setContent] = createSignal<BuilderContent | null>(null);
  const [canShowContent, setCanShowContent] = createSignal(false);

  createEffect(() => {
    fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then((data: any) => {
      setContent(data);
      setCanShowContent(data ? true : isPreviewing());
    });
  });

  return (
    <>
      {canShowContent() ? (
        <Content content={content()} apiKey={BUILDER_API_KEY} model="page" />
      ) : (
        <div>Not found</div>
      )}
    </>
  );
}

export default App;
