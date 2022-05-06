import { TARGET } from '../../constants/target';
import BuilderContext from '../../context/builder.context.lite';
import { evaluate } from '../../functions/evaluate';
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from '../../functions/get-builder-search-params';
import { getContent } from '../../functions/get-content';
import { getFetch } from '../../functions/get-fetch';
import { isBrowser } from '../../functions/is-browser';
import { isEditing } from '../../functions/is-editing';
import { isPreviewing } from '../../functions/is-previewing';
import { previewingModelName } from '../../functions/previewing-model-name';
import { track } from '../../functions/track';
import { BuilderContent } from '../../types/builder-content';
import { Dictionary, Nullable } from '../../types/typescript';
import RenderBlocks from '../render-blocks.lite';
import RenderContentStyles from './components/render-styles.lite';
import {
  Show,
  onMount,
  onUnMount,
  onUpdate,
  setContext,
  useState,
} from '@builder.io/mitosis';

export type RenderContentProps = {
  content?: BuilderContent;
  model?: string;
  data?: { [key: string]: any };
  context?: { [key: string]: any };
  apiKey: string;
};

interface BuilderComponentStateChange {
  state: { [key: string]: any };
  ref: {
    name?: string;
    props?: {
      builderBlock?: {
        id?: string;
      };
    };
  };
}

export default function RenderContent(props: RenderContentProps) {
  const state = useState({
    get useContent(): Nullable<BuilderContent> {
      const mergedContent: BuilderContent = {
        ...props.content,
        ...state.overrideContent,
        data: {
          ...props.content?.data,
          ...props.data,
          ...state.overrideContent?.data,
        },
      };
      return mergedContent;
    },
    overrideContent: null as Nullable<BuilderContent>,
    update: 0,
    overrideState: {} as Dictionary<any>,
    get contentState(): Dictionary<any> {
      return {
        ...props.content?.data?.state,
        ...props.data,
        ...state.overrideState,
      };
    },
    get context() {
      return {} as { [index: string]: any };
    },

    processMessage(event: MessageEvent): void {
      const { data } = event;
      if (data) {
        switch (data.type) {
          case 'builder.contentUpdate': {
            const messageContent = data.data;
            const key =
              messageContent.key ||
              messageContent.alias ||
              messageContent.entry ||
              messageContent.modelName;

            const contentData = messageContent.data;

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

    evaluateJsCode() {
      // run any dynamic JS code attached to content
      const jsCode = state.useContent?.data?.jsCode;
      if (jsCode) {
        evaluate({
          code: jsCode,
          context: state.context,
          state: state.contentState,
        });
      }
    },
    get httpReqsData(): { [index: string]: any } {
      return {};
    },

    evalExpression(expression: string) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: state.context,
          state: state.contentState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      const fetchAndSetState = async () => {
        const fetch = await getFetch();
        const response = await fetch(url);
        const json = await response.json();

        const newOverrideState = {
          ...state.overrideState,
          [key]: json,
        };
        state.overrideState = newOverrideState;
      };
      fetchAndSetState();
    },
    runHttpRequests() {
      const requests = state.useContent?.data?.httpRequests ?? {};

      Object.entries(requests).forEach(([key, url]) => {
        if (url && (!state.httpReqsData[key] || isEditing())) {
          const evaluatedUrl = state.evalExpression(url);
          state.handleRequest({ url: evaluatedUrl, key });
        }
      });
    },
    emitStateUpdate() {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>(
          'builder:component:stateChange',
          {
            detail: {
              state: state.contentState,
              ref: {
                name: props.model,
              },
            },
          }
        )
      );
    },
  });

  // This currently doesn't do anything as `onCreate` is not implemented
  // onCreate(() => {
  //   state.state = ifTarget(
  //     // The reactive targets
  //     ['vue', 'solid'],
  //     () => ({}),
  //     () =>
  //       // This is currently a no-op, since it's listening to changes on `{}`.
  //       onChange({}, () => {
  //         state.update = state.update + 1;
  //       })
  //   );

  // TODO: inherit context here too
  // });

  setContext(BuilderContext, {
    get content() {
      return state.useContent;
    },
    get state() {
      return state.contentState;
    },
    get context() {
      return state.context;
    },
    get apiKey() {
      return props.apiKey;
    },
  });

  onMount(() => {
    if (isBrowser()) {
      if (isEditing()) {
        window.addEventListener('message', state.processMessage);
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          state.emitStateUpdate
        );
      }
      if (state.useContent) {
        track('impression', {
          contentId: state.useContent.id,
        });
      }

      // override normal content in preview mode
      if (isPreviewing()) {
        if (props.model && previewingModelName() === props.model) {
          const currentUrl = new URL(location.href);
          const previewApiKey = currentUrl.searchParams.get('apiKey');

          if (previewApiKey) {
            getContent({
              model: props.model,
              apiKey: previewApiKey,
              options: getBuilderSearchParams(
                convertSearchParamsToQueryObject(currentUrl.searchParams)
              ),
            }).then((content) => {
              if (content) {
                state.overrideContent = content;
              }
            });
          }
        }
      }

      state.evaluateJsCode();
      state.runHttpRequests();
      state.emitStateUpdate();
    }
  });

  onUpdate(() => {
    state.evaluateJsCode();
  }, [state.useContent?.data?.jsCode]);

  onUpdate(() => {
    state.runHttpRequests();
  }, [state.useContent?.data?.httpRequests]);

  onUpdate(() => {
    state.emitStateUpdate();
  }, [state.contentState]);

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        state.emitStateUpdate
      );
    }
  });

  // TODO: `else` message for when there is no content passed, or maybe a console.log
  return (
    <Show when={state.useContent}>
      <div
        onClick={() =>
          track('click', {
            contentId: state.useContent!.id,
          })
        }
        data-builder-content-id={state.useContent?.id}
      >
        {(state.useContent?.data?.cssCode ||
          state.useContent?.data?.customFonts?.length) &&
          TARGET !== 'reactNative' && (
            <RenderContentStyles
              cssCode={state.useContent.data.cssCode}
              customFonts={state.useContent.data.customFonts}
            />
          )}
        <RenderBlocks blocks={state.useContent?.data?.blocks} />
      </div>
    </Show>
  );
}
