import type { BuilderContextInterface } from '../../../context/types.js';
import { evaluate } from '../../../functions/evaluate/index.js';
import { fetch } from '../../../functions/get-fetch.js';
import { isBrowser } from '../../../functions/is-browser.js';
import { isEditing } from '../../../functions/is-editing.js';
import { createRegisterComponentMessage } from '../../../functions/register-component.js';
import { _track } from '../../../functions/track/index.js';
import builderContext from '../../../context/builder.context.lite.js';
import type { Signal } from '@builder.io/mitosis';
import {
  Show,
  onMount,
  onUnMount,
  onUpdate,
  useStore,
  useMetadata,
  useRef,
  setContext,
  useTarget,
} from '@builder.io/mitosis';
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../../scripts/init-editing.js';
import { getInteractionPropertiesForEvent } from '../../../functions/track/interaction.js';
import type {
  ContentProps,
  BuilderComponentStateChange,
} from '../content.types.js';
import type { ComponentInfo } from '../../../types/components.js';
import { fetchOneEntry } from '../../../functions/get-content/index.js';
import { isPreviewing } from '../../../functions/is-previewing.js';
import type { BuilderContent } from '../../../types/builder-content.js';
import { postPreviewContent } from '../../../helpers/preview-lru-cache/set.js';
import { fastClone } from '../../../functions/fast-clone.js';
import { logger } from '../../../helpers/logger.js';
import { getDefaultCanTrack } from '../../../helpers/canTrack.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
  plugins: {
    reactNative: {
      useScrollView: true,
    },
  },
});

type BuilderEditorProps = Omit<
  ContentProps,
  'customComponents' | 'data' | 'apiVersion' | 'isSsrAbTest'
> & {
  builderContextSignal: Signal<BuilderContextInterface>;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};

export default function EnableEditor(props: BuilderEditorProps) {
  const elementRef = useRef<HTMLDivElement>();
  const state = useStore({
    forceReRenderCount: 0,
    mergeNewContent(newContent: BuilderContent) {
      const newContentValue = {
        ...props.builderContextSignal.value.content,
        ...newContent,
        data: {
          ...props.builderContextSignal.value.content?.data,
          ...newContent?.data,
        },
        meta: {
          ...props.builderContextSignal.value.content?.meta,
          ...newContent?.meta,
          breakpoints:
            newContent?.meta?.breakpoints ||
            props.builderContextSignal.value.content?.meta?.breakpoints,
        },
      };

      useTarget({
        rsc: () => {
          postPreviewContent({
            value: newContentValue,
            key: newContentValue.id!,
          }).then(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            router.refresh();
          });
        },
        default: () => {
          props.builderContextSignal.value.content = newContentValue;
        },
      });
    },
    lastUpdated: 0,
    shouldSendResetCookie: false,
    processMessage(event: MessageEvent): void {
      const { data } = event;

      if (data) {
        switch (data.type) {
          case 'builder.configureSdk': {
            const messageContent = data.data;
            const { breakpoints, contentId } = messageContent;
            if (
              !contentId ||
              contentId !== props.builderContextSignal.value.content?.id
            ) {
              return;
            }
            if (breakpoints) {
              state.mergeNewContent({ meta: { breakpoints } });
            }
            state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
            break;
          }
          case 'builder.contentUpdate': {
            const messageContent = data.data;
            const key =
              messageContent.key ||
              messageContent.alias ||
              messageContent.entry ||
              messageContent.modelName;

            const contentData = messageContent.data;

            if (key === props.model) {
              state.mergeNewContent(contentData);
              state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
            }
            break;
          }
        }
      }
    },
    evaluateJsCode() {
      // run any dynamic JS code attached to content
      const jsCode = props.builderContextSignal.value.content?.data?.jsCode;
      if (jsCode) {
        evaluate({
          code: jsCode,
          context: props.context || {},
          localState: undefined,
          rootState: props.builderContextSignal.value.rootState,
          rootSetState: props.builderContextSignal.value.rootSetState,
        });
      }
    },
    httpReqsData: {} as { [key: string]: boolean },

    clicked: false,

    onClick(event: any) {
      if (props.builderContextSignal.value.content) {
        const variationId =
          props.builderContextSignal.value.content?.testVariationId;
        const contentId = props.builderContextSignal.value.content?.id;
        _track({
          type: 'click',
          canTrack: getDefaultCanTrack(props.canTrack),
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
          ...getInteractionPropertiesForEvent(event),
          unique: !state.clicked,
        });
      }

      if (!state.clicked) {
        state.clicked = true;
      }
    },

    evalExpression(expression: string) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: props.context || {},
          localState: undefined,
          rootState: props.builderContextSignal.value.rootState,
          rootSetState: props.builderContextSignal.value.rootSetState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const newState = {
            ...props.builderContextSignal.value.rootState,
            [key]: json,
          };
          props.builderContextSignal.value.rootSetState?.(newState);
          state.httpReqsData[key] = true;
        })
        .catch((err) => {
          console.error('error fetching dynamic data', url, err);
        });
    },
    runHttpRequests() {
      const requests: { [key: string]: string } =
        props.builderContextSignal.value.content?.data?.httpRequests ?? {};

      Object.entries(requests).forEach(([key, url]) => {
        if (url && (!state.httpReqsData[key] || isEditing())) {
          const evaluatedUrl = state.evalExpression(url);
          state.handleRequest({ url: evaluatedUrl, key });
        }
      });
    },
    emitStateUpdate() {
      if (isEditing()) {
        window.dispatchEvent(
          new CustomEvent<BuilderComponentStateChange>(
            'builder:component:stateChange',
            {
              detail: {
                state: fastClone(props.builderContextSignal.value.rootState),
                ref: {
                  name: props.model,
                },
              },
            }
          )
        );
      }
    },
  });

  setContext(builderContext, props.builderContextSignal);

  onUpdate(() => {
    useTarget({
      rsc: () => {},
      default: () => {
        if (props.content) {
          state.mergeNewContent(props.content);
        }
      },
    });
  }, [props.content]);

  onUpdate(() => {
    useTarget({
      rsc: () => {
        if (isBrowser()) {
          window.removeEventListener('message', state.processMessage);
          window.addEventListener('message', state.processMessage);
        }
      },
    });
  }, [state.shouldSendResetCookie]);

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        state.emitStateUpdate
      );
    }
  });

  onMount(() => {
    if (!props.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      );
    }

    if (isBrowser()) {
      if (isEditing()) {
        state.forceReRenderCount = state.forceReRenderCount + 1;
        window.addEventListener('message', state.processMessage);

        registerInsertMenu();
        setupBrowserForEditing({
          ...(props.locale ? { locale: props.locale } : {}),
          ...(props.includeRefs ? { includeRefs: props.includeRefs } : {}),
          ...(props.enrich ? { enrich: props.enrich } : {}),
        });
        Object.values<ComponentInfo>(
          props.builderContextSignal.value.componentInfos
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, '*');
        });
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          state.emitStateUpdate
        );
      }
      if (props.builderContextSignal.value.content) {
        const variationId =
          props.builderContextSignal.value.content?.testVariationId;
        const contentId = props.builderContextSignal.value.content?.id;
        _track({
          type: 'impression',
          canTrack: getDefaultCanTrack(props.canTrack),
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

      useTarget({
        rsc: () => {},
        default: () => {
          // override normal content in preview mode
          if (isPreviewing()) {
            const searchParams = new URL(location.href).searchParams;
            const searchParamPreviewModel = searchParams.get('builder.preview');
            const searchParamPreviewId = searchParams.get(
              `builder.preview.${searchParamPreviewModel}`
            );
            const previewApiKey =
              searchParams.get('apiKey') || searchParams.get('builder.space');

            /**
             * Make sure that:
             * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered
             *  at the same time, e.g. header/page/footer.
             * - the API key is the same, since we don't want to preview content from other organizations.
             * - if there is content, that the preview ID is the same as that of the one we receive.
             *
             * TO-DO: should we only update the state when there is a change?
             **/
            if (
              searchParamPreviewModel === props.model &&
              previewApiKey === props.apiKey &&
              (!props.content || searchParamPreviewId === props.content.id)
            ) {
              fetchOneEntry({
                model: props.model,
                apiKey: props.apiKey,
                apiVersion: props.builderContextSignal.value.apiVersion,
              }).then((content) => {
                if (content) {
                  state.mergeNewContent(content);
                }
              });
            }
          }
        },
      });

      state.evaluateJsCode();
      state.runHttpRequests();
      state.emitStateUpdate();
    }
  });

  onUpdate(() => {
    state.evaluateJsCode();
  }, [
    props.builderContextSignal.value.content?.data?.jsCode,
    props.builderContextSignal.value.rootState,
  ]);

  onUpdate(() => {
    state.runHttpRequests();
  }, [props.builderContextSignal.value.content?.data?.httpRequests]);

  onUpdate(() => {
    state.emitStateUpdate();
  }, [props.builderContextSignal.value.rootState]);

  return (
    <Show when={props.builderContextSignal.value.content}>
      <div
        key={state.forceReRenderCount}
        ref={elementRef}
        onClick={(event) => state.onClick(event)}
        builder-content-id={props.builderContextSignal.value.content?.id}
        builder-model={props.model}
        className={props.classNameProp}
        {...useTarget({
          reactNative: {
            // currently, we can't set the actual ID here.
            // we don't need it right now, we just need to identify content divs for testing.
            dataSet: { 'builder-content-id': '' },
          },
          default: {},
        })}
        {...(props.showContent ? {} : { hidden: true, 'aria-hidden': true })}
      >
        {props.children}
      </div>
    </Show>
  );
}
