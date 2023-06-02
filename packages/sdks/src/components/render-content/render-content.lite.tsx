import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
import type {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { evaluate } from '../../functions/evaluate.js';
import { getContent } from '../../functions/get-content/index.js';
import { fetch } from '../../functions/get-fetch.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import {
  components,
  createRegisterComponentMessage,
} from '../../functions/register-component.js';
import { _track } from '../../functions/track/index.js';
import type {
  Breakpoints,
  BuilderContent,
} from '../../types/builder-content.js';
import type { Nullable } from '../../types/typescript.js';
import RenderBlocks from '../render-blocks.lite';
import RenderContentStyles from './components/render-styles.lite';
import builderContext from '../../context/builder.context.lite';
import {
  Show,
  onMount,
  onUnMount,
  onUpdate,
  useStore,
  useMetadata,
  useRef,
  setContext,
} from '@builder.io/mitosis';
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../scripts/init-editing.js';
import { checkIsDefined } from '../../helpers/nullable.js';
import { getInteractionPropertiesForEvent } from '../../functions/track/interaction.js';
import type {
  RenderContentProps,
  BuilderComponentStateChange,
} from './render-content.types.js';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './render-content.helpers.js';
import { TARGET } from '../../constants/target.js';
import { logger } from '../../helpers/logger.js';
import { wrapComponentRef } from './wrap-component-ref.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
  solid: {
    state: {
      useContent: 'store',
    },
  },
});

export default function RenderContent(props: RenderContentProps) {
  const elementRef = useRef<HTMLDivElement>();
  const state = useStore({
    forceReRenderCount: 0,
    overrideContent: null as Nullable<BuilderContent>,
    useContent: getContentInitialValue({
      content: props.content,
      data: props.data,
    }),
    mergeNewContent(newContent: BuilderContent) {
      state.useContent = {
        ...state.useContent,
        ...newContent,
        data: {
          ...state.useContent?.data,
          ...newContent?.data,
        },
        meta: {
          ...state.useContent?.meta,
          ...newContent?.meta,
          breakpoints:
            newContent?.meta?.breakpoints ||
            state.useContent?.meta?.breakpoints,
        },
      };
    },
    setBreakpoints(breakpoints: Breakpoints) {
      state.useContent = {
        ...state.useContent,
        meta: {
          ...state.useContent?.meta,
          breakpoints,
        },
      };
    },
    update: 0,
    canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,
    contentState: getContextStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    }),
    contentSetState: (newRootState: BuilderRenderState) => {
      state.contentState = newRootState;
    },

    allRegisteredComponents: [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce(
      (acc, { component, ...curr }) => ({
        ...acc,
        [curr.name]: {
          component:
            TARGET === 'vue3' ? wrapComponentRef(component) : component,
          ...curr,
        },
      }),
      {} as RegisteredComponents
    ),

    processMessage(event: MessageEvent): void {
      const { data } = event;
      if (data) {
        switch (data.type) {
          case 'builder.configureSdk': {
            const messageContent = data.data;
            const { breakpoints, contentId } = messageContent;
            if (!contentId || contentId !== state.useContent?.id) {
              return;
            }
            if (breakpoints) {
              state.setBreakpoints(breakpoints);
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
          context: props.context || {},
          localState: undefined,
          rootState: state.contentState,
          rootSetState: state.contentSetState,
        });
      }
    },
    httpReqsData: {} as { [key: string]: any },

    clicked: false,

    onClick(event: any) {
      if (state.useContent) {
        const variationId = state.useContent?.testVariationId;
        const contentId = state.useContent?.id;
        _track({
          type: 'click',
          canTrack: state.canTrackToUse,
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
          rootState: state.contentState,
          rootSetState: state.contentSetState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const newState = {
            ...state.contentState,
            [key]: json,
          };
          state.contentSetState(newState);
        })
        .catch((err) => {
          console.error('error fetching dynamic data', url, err);
        });
    },
    runHttpRequests() {
      const requests: { [key: string]: string } =
        state.useContent?.data?.httpRequests ?? {};

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
                state: state.contentState,
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

  setContext(builderContext, {
    content: state.useContent,
    localState: undefined,
    rootState: state.contentState,
    rootSetState: TARGET === 'qwik' ? undefined : state.contentSetState,
    context: props.context || {},
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    registeredComponents: state.allRegisteredComponents,
    inheritedStyles: {},
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
        registerInsertMenu();
        setupBrowserForEditing({
          ...(props.locale ? { locale: props.locale } : {}),
          ...(props.includeRefs ? { includeRefs: props.includeRefs } : {}),
          ...(props.enrich ? { enrich: props.enrich } : {}),
        });
        Object.values<RegisteredComponent>(
          state.allRegisteredComponents
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, '*');
        });
        window.addEventListener('message', state.processMessage);
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          state.emitStateUpdate
        );
      }
      if (state.useContent) {
        const variationId = state.useContent?.testVariationId;
        const contentId = state.useContent?.id;
        _track({
          type: 'impression',
          canTrack: state.canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

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
          getContent({
            model: props.model,
            apiKey: props.apiKey,
            apiVersion: props.apiVersion,
          }).then((content) => {
            if (content) {
              state.mergeNewContent(content);
            }
          });
        }
      }

      state.evaluateJsCode();
      state.runHttpRequests();
      state.emitStateUpdate();
    }
  });

  onUpdate(() => {
    if (props.content) {
      state.mergeNewContent(props.content);
    }
  }, [props.content]);

  onUpdate(() => {
    state.evaluateJsCode();
  }, [state.useContent?.data?.jsCode, state.contentState]);

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
        ref={elementRef}
        onClick={(event) => state.onClick(event)}
        builder-content-id={state.useContent?.id}
        builder-model={props.model}
      >
        <Show when={TARGET !== 'reactNative'}>
          <RenderContentStyles
            contentId={state.useContent?.id}
            cssCode={state.useContent?.data?.cssCode}
            customFonts={state.useContent?.data?.customFonts}
          />
        </Show>
        <RenderBlocks
          blocks={state.useContent?.data?.blocks}
          key={state.forceReRenderCount}
        />
      </div>
    </Show>
  );
}
