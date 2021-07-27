import { onMount, onUnMount, setContext, useState } from '@jsx-lite/core';
import { isBrowser } from '../functions/is-browser';
import { BuilderContent } from '../types/builder-content';
import RenderBlock from './render-block.lite';
import BuilderContext from '../context/builder.context.lite';

export type RenderContentProps = {
  content?: BuilderContent;
  model?: string;
  data?: { [key: string]: any };
  context?: { [key: string]: any };
};

export default function RenderContent(props: RenderContentProps) {
  const state = useState({
    get useContent(): any {
      return state.overrideContent || props.content;
    },
    state: {},
    // props.context or inherit from parent context
    context: {},
    overrideContent: null,
    processMessage(event: MessageEvent): void {
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
    },
  });

  setContext(BuilderContext, {
    content: props.content,
    state: state.state,
    context: state.context,
  });

  onMount(() => {
    if (isBrowser()) {
      window.addEventListener('message', state.processMessage);
    }
  });

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
    }
  });

  return (
    <>
      {state.useContent?.data?.cssCode && <style>{state.useContent.data.cssCode}</style>}
      {state.useContent?.data?.blocks?.map((block: any) => (
        <RenderBlock block={block} />
      ))}
    </>
  );
}
