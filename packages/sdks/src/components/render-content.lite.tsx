import { onMount, onUnMount, useState } from '@jsx-lite/core';
import { isBrowser } from '../functions/is-browser';
import { BuilderContent } from '../types/builder-content';
import RenderBlock from './render-block.lite';

export type RenderContentProps = {
  content?: BuilderContent;
  model?: string;
};

export default function RenderContent(props: RenderContentProps) {
  const state = useState({
    get content() {
      return state.overrideContent || props.content;
    },
    overrideContent: null,
  });

  function processMessage(event: MessageEvent) {
    const { data } = event;
    if (data) {
      switch (data.type) {
        case 'builder.contentUpdate': {
          const key = data.data.key || data.data.alias || data.data.entry || data.data.modelName;

          const contentData = data.data.data; // oof

          if (key === props.model) {
            state.overrideContent = contentData;
          }
          break;
        }
        case 'builder.patchUpdates': {
          // TODO
          break;
        }
      }
    }
  }

  onMount(() => {
    if (isBrowser()) {
      window.addEventListener('message', processMessage);
    }
  });

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', processMessage);
    }
  });

  return (
    <>
      {state.content?.data?.blocks?.map((block: any) => (
        <RenderBlock block={block} />
      ))}
    </>
  );
}
