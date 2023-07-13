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
  useState,
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
import { getRenderContentScriptString } from '../render-content-variants/helpers.js';
import { wrapComponentRef } from './wrap-component-ref.js';
import { useTarget } from '@builder.io/mitosis';
import InlinedScript from '../inlined-script.lite.jsx';

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
    mergeNewContent(newContent: BuilderContent) {
      builderContextSignal.value.content = {
        ...builderContextSignal.value.content,
        ...newContent,
        data: {
          ...builderContextSignal.value.content?.data,
          ...newContent?.data,
        },
        meta: {
          ...builderContextSignal.value.content?.meta,
          ...newContent?.meta,
          breakpoints:
            newContent?.meta?.breakpoints ||
            builderContextSignal.value.content?.meta?.breakpoints,
        },
      };
    },
    setBreakpoints(breakpoints: Breakpoints) {
      builderContextSignal.value.content = {
        ...builderContextSignal.value.content,
        meta: {
          ...builderContextSignal.value.content?.meta,
          breakpoints,
        },
      };
    },
    update: 0,
    canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,
    contentSetState: (newRootState: BuilderRenderState) => {
      builderContextSignal.value.rootState = newRootState;
    },

    processMessage(event: MessageEvent): void {
      const { data } = event;
      if (data) {
        switch (data.type) {
          case 'builder.configureSdk': {
            const messageContent = data.data;
            const { breakpoints, contentId } = messageContent;
            if (
              !contentId ||
              contentId !== builderContextSignal.value.content?.id
            ) {
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
      const jsCode = builderContextSignal.value.content?.data?.jsCode;
      if (jsCode) {
        evaluate({
          code: jsCode,
          context: props.context || {},
          localState: undefined,
          rootState: builderContextSignal.value.rootState,
          rootSetState: state.contentSetState,
        });
      }
    },
    httpReqsData: {} as { [key: string]: any },

    clicked: false,

    onClick(event: any) {
      if (builderContextSignal.value.content) {
        const variationId = builderContextSignal.value.content?.testVariationId;
        const contentId = builderContextSignal.value.content?.id;
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
          rootState: builderContextSignal.value.rootState,
          rootSetState: state.contentSetState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const newState = {
            ...builderContextSignal.value.rootState,
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
        builderContextSignal.value.content?.data?.httpRequests ?? {};

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
                state: builderContextSignal.value.rootState,
                ref: {
                  name: props.model,
                },
              },
            }
          )
        );
      }
    },
    scriptStr: getRenderContentScriptString({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id!,
      parentContentId: props.parentContentId!,
    }),
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

  const [builderContextSignal] = useState(
    {
      content: getContentInitialValue({
        content: props.content,
        data: props.data,
      }),
      localState: undefined,
      rootState: getContextStateInitialValue({
        content: props.content,
        data: props.data,
        locale: props.locale,
      }),
      rootSetState: useTarget({
        qwik: undefined,
        default: state.contentSetState,
      }),
      context: props.context || {},
      apiKey: props.apiKey,
      apiVersion: props.apiVersion,
      registeredComponents: [
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
      inheritedStyles: {},
    },
    { reactive: true }
  );

  setContext(builderContext, builderContextSignal);

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
          builderContextSignal.value.registeredComponents
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
      if (builderContextSignal.value.content) {
        const variationId = builderContextSignal.value.content?.testVariationId;
        const contentId = builderContextSignal.value.content?.id;
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
  }, [
    builderContextSignal.value.content?.data?.jsCode,
    builderContextSignal.value.rootState,
  ]);

  onUpdate(() => {
    state.runHttpRequests();
  }, [builderContextSignal.value.content?.data?.httpRequests]);

  onUpdate(() => {
    state.emitStateUpdate();
  }, [builderContextSignal.value.rootState]);

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
    <Show when={builderContextSignal.value.content}>
      <div
        ref={elementRef}
        onClick={(event) => state.onClick(event)}
        builder-content-id={builderContextSignal.value.content?.id}
        builder-model={props.model}
        className={props.classNameProp}
        {...(TARGET === 'reactNative'
          ? {
              dataSet: {
                // currently, we can't set the actual ID here.
                // we don't need it right now, we just need to identify content divs for testing.
                'builder-content-id': '',
              },
            }
          : {})}
        {...(props.hideContent ? { hidden: true, 'aria-hidden': true } : {})}
      >
        <Show when={props.isSsrAbTest}>
          <InlinedScript scriptStr={state.scriptStr} />
        </Show>
        <Show when={TARGET !== 'reactNative'}>
          <RenderContentStyles
            contentId={builderContextSignal.value.content?.id}
            cssCode={builderContextSignal.value.content?.data?.cssCode}
            customFonts={builderContextSignal.value.content?.data?.customFonts}
          />
        </Show>
        <RenderBlocks
          blocks={builderContextSignal.value.content?.data?.blocks}
          key={state.forceReRenderCount}
        />
      </div>
    </Show>
  );
}
