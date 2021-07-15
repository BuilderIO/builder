import { onMount, onUnMount } from '@jsx-lite/core';
import { isBrowser } from '../functions/is-browser';
import { BuilderContent } from '../types/builder-content';
import RenderBlock from './render-block';

export type RenderContentProps = {
  content?: BuilderContent;
};

export default function RenderContent(props: RenderContentProps) {
  function processMessage(event: MessageEvent) {
    const { data } = event;
    if (data) {
      switch (data.type) {
        case 'builder.contentUpdate': {
          // TODO
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
      {props.content?.data?.blocks?.map((block: any) => (
        <RenderBlock block={block} />
      ))}
    </>
  );
}
