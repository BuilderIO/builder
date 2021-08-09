import { onMount, onUnMount, setContext, useState, onCreate } from '@builder.io/mitosis';
import { isBrowser } from '../functions/is-browser';
import { BuilderContent } from '../types/builder-content';
import RenderBlock from './render-block.lite';
import BuilderContext from '../context/builder.context.lite';
import { track } from '../functions/track';
import { ifTarget } from '../functions/if-target';
import { onChange } from '../functions/on-change';

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
    update: 0,
    state: {},
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

  onCreate(() => {
    state.state = ifTarget(
      // The reactive targets
      ['vue', 'solid'],
      () => ({}),
      () =>
        onChange({}, () => {
          state.update = state.update + 1;
        })
    );

    // TODO: inherit context here too
  });

  setContext(BuilderContext, {
    get content() {
      return props.content;
    },
    get state() {
      return state.state;
    },
    get context() {
      return state.context;
    },
  });

  onMount(() => {
    if (isBrowser()) {
      window.addEventListener('message', state.processMessage);
      // TODO: run this when content is defined
      // track('impression', {
      //   contentId: props.content!.id,
      // });
    }
  });

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
    }
  });

  return (
    <div
      onClick={e => {
        track('click', {
          contentId: props.content!.id,
        });
      }}
      data-builder-content-id={props.content?.id}
    >
      {state.useContent?.data?.cssCode && <style>{state.useContent.data.cssCode}</style>}
      {state.useContent?.data?.blocks?.map((block: any) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
