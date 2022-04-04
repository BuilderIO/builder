import {
  onMount,
  onUnMount,
  setContext,
  useState,
  onCreate,
  Show,
  onUpdate,
} from '@builder.io/mitosis';
import { isBrowser } from '../functions/is-browser';
import { BuilderContent } from '../types/builder-content';
import BuilderContext from '../context/builder.context.lite';
import { track } from '../functions/track';
import { isReactNative } from '../functions/is-react-native';
import { isEditing } from '../functions/is-editing';
import { isPreviewing } from '../functions/is-previewing';
import { previewingModelName } from '../functions/previewing-model-name';
import { getContent } from '../functions/get-content';
import {
  convertSearchParamsToQueryObject,
  getBuilderSearchParams,
} from '../functions/get-builder-search-params';
import RenderBlocks from './render-blocks.lite';
import { Nullable } from '../types/typescript';
import { evaluate } from '../functions/evaluate';
import { getFetch } from '../functions/get-fetch';
import { onChange } from '../functions/on-change';

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
      return state.overrideContent || props.content;
    },
    update: 0,
    get state(): { [key: string]: any } {
      return props.content?.data?.state || {};
    },
    get context() {
      return {} as { [index: string]: any };
    },
    overrideContent: null as Nullable<BuilderContent>,
    getCssFromFont(font: any, data?: any) {
      // TODO: compute what font sizes are used and only load those.......
      const family =
        font.family +
        (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
      const name = family.split(',')[0];
      const url = font.fileUrl ?? font?.files?.regular;
      let str = '';
      if (url && family && name) {
        str += `
  @font-face {
    font-family: "${family}";
    src: local("${name}"), url('${url}') format('woff2');
    font-display: fallback;
    font-weight: 400;
  }
          `.trim();
      }

      if (font.files) {
        for (const weight in font.files) {
          const isNumber = String(Number(weight)) === weight;
          if (!isNumber) {
            continue;
          }
          // TODO: maybe limit number loaded
          const weightUrl = font.files[weight];
          if (weightUrl && weightUrl !== url) {
            str += `
  @font-face {
    font-family: "${family}";
    src: url('${weightUrl}') format('woff2');
    font-display: fallback;
    font-weight: ${weight};
  }
            `.trim();
          }
        }
      }
      return str;
    },

    getFontCss(data?: any) {
      // TODO: flag for this
      // if (!this.builder.allowCustomFonts) {
      //   return '';
      // }
      // TODO: separate internal data from external
      return (
        data?.customFonts
          ?.map((font: any) => this.getCssFromFont(font, data))
          ?.join(' ') || ''
      );
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

            console.log('content update', key, contentData);

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
          state: state.state,
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
          state: state.state,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      console.log('handleReq');

      const fetchAndSetState = async () => {
        console.log('fetch: ', { url, key });

        const response = await getFetch()(url);
        const json = await response.json();
        state.state[key] = json;
      };
      fetchAndSetState();
    },
    runHttpRequests() {
      const requests = state.useContent?.data?.httpRequests ?? {};
      console.log('about to run HTTP requests', requests.toString());

      Object.entries(requests).forEach(([key, url]) => {
        if (url && (!state.httpReqsData[key] || isEditing())) {
          const evaluatedUrl = state.evalExpression(url);
          if (isBrowser()) {
            state.handleRequest({ url: evaluatedUrl, key });
          } else {
          }
        }
      });
    },
    emitStateUpdate() {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>(
          'builder:component:stateChange',
          {
            detail: {
              state: state.state,
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
  onCreate(() => {
    state.state = ifTarget(
      // The reactive targets
      ['vue', 'solid'],
      () => ({}),
      () =>
        // This is currently a no-op, since it's listening to changes on `{}`.
        onChange({}, () => {
          state.update = state.update + 1;
        })
    );

    // TODO: inherit context here too
  });

  setContext(BuilderContext, {
    get content() {
      return state.useContent;
    },
    get state() {
      return state.state;
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
  }, [state.state]);

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
        onClick={(_e) =>
          track('click', {
            contentId: state.useContent!.id,
          })
        }
        data-builder-content-id={state.useContent?.id}
      >
        {(state.useContent?.data?.cssCode ||
          state.useContent?.data?.customFonts?.length) &&
          !isReactNative() && (
            <style>
              {state.useContent.data.cssCode}
              {state.getFontCss(state.useContent.data)}
            </style>
          )}
        <RenderBlocks blocks={state.useContent?.data?.blocks} />
      </div>
    </Show>
  );
}
