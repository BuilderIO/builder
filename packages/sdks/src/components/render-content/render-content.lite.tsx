import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
import { TARGET } from '../../constants/target.js';
import BuilderContext from '../../context/builder.context.lite';
import type {
  BuilderRenderContext,
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { evaluate } from '../../functions/evaluate.js';
import { getContent } from '../../functions/get-content/index.js';
import { getFetch } from '../../functions/get-fetch.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import {
  components,
  createRegisterComponentMessage,
} from '../../functions/register-component.js';
import { _track } from '../../functions/track.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { Dictionary, Nullable } from '../../types/typescript.js';
import RenderBlocks from '../render-blocks.lite';
import RenderContentStyles from './components/render-styles.lite';
import {
  Show,
  onMount,
  onUnMount,
  onUpdate,
  setContext,
  useStore,
  useMetadata,
  useRef,
} from '@builder.io/mitosis';
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../scripts/init-editing.js';
import { markMutable } from '../../functions/mark-mutable.js';

useMetadata({
  qwik: {
    component: {
      useHostElement: true,
    },
  },
  solid: {
    state: {
      useContent: 'store',
    },
  },
});

export type RenderContentProps = {
  content?: Nullable<BuilderContent>;
  model?: string;
  data?: { [key: string]: any };
  context?: BuilderRenderContext;
  apiKey: string;
  customComponents?: RegisteredComponent[];
  canTrack?: boolean;
};

interface BuilderComponentStateChange {
  state: BuilderRenderState;
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
  const elementRef = useRef<HTMLDivElement>();
  const state = useStore({
    forceReRenderCount: 0,
    get useContent(): Nullable<BuilderContent> {
      if (!props.content && !state.overrideContent) {
        return undefined;
      }
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
    get canTrackToUse(): boolean {
      return props.canTrack || true;
    },
    overrideState: {} as BuilderRenderState,
    get contentState(): BuilderRenderState {
      return {
        ...props.content?.data?.state,
        ...props.data,
        ...state.overrideState,
      };
    },
    get contextContext() {
      return props.context || {};
    },

    get allRegisteredComponents(): RegisteredComponents {
      const allComponentsArray = [
        ...getDefaultRegisteredComponents(),
        // While this `components` object is deprecated, we must maintain support for it.
        // Since users are able to override our default components, we need to make sure that we do not break such
        // existing usage.
        // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
        // which is the new standard way of providing custom components, and must therefore take precedence.
        ...components,
        ...(props.customComponents || []),
      ];

      const allComponents = allComponentsArray.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.name]: curr,
        }),
        {} as RegisteredComponents
      );

      return allComponents;
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
          context: state.contextContext,
          state: state.contentState,
        });
      }
    },
    get httpReqsData(): Dictionary<any> {
      return {};
    },

    onClick(_event: MouseEvent) {
      if (state.useContent) {
        const variationId = state.useContent?.testVariationId;
        const contentId = state.useContent?.id;
        _track({
          type: 'click',
          canTrack: state.canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }
    },

    evalExpression(expression: string) {
      return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
        evaluate({
          code: group,
          context: state.contextContext,
          state: state.contentState,
        })
      );
    },
    handleRequest({ url, key }: { key: string; url: string }) {
      getFetch()
        .then((fetch) => fetch(url))
        .then((response) => response.json())
        .then((json) => {
          const newOverrideState = {
            ...state.overrideState,
            [key]: json,
          };
          state.overrideState = newOverrideState;
        })
        .catch((err) => {
          console.log('error fetching dynamic data', url, err);
        });
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
    get shouldRenderContentStyles(): boolean {
      return Boolean(
        (state.useContent?.data?.cssCode ||
          state.useContent?.data?.customFonts?.length) &&
          TARGET !== 'reactNative'
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
      return state.contextContext;
    },
    get apiKey() {
      return props.apiKey;
    },
    get registeredComponents() {
      return state.allRegisteredComponents;
    },
  });

  onMount(() => {
    if (isBrowser()) {
      if (isEditing()) {
        state.forceReRenderCount = state.forceReRenderCount + 1;
        registerInsertMenu();
        setupBrowserForEditing();
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
        if (
          props.model &&
          searchParams.get('builder.preview') === props.model
        ) {
          const previewApiKey =
            searchParams.get('apiKey') || searchParams.get('builder.space');
          if (previewApiKey) {
            getContent({
              model: props.model,
              apiKey: previewApiKey,
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
        ref={elementRef}
        onClick={(event) => state.onClick(event)}
        builder-content-id={state.useContent?.id}
        builder-model={props.model}
      >
        {state.shouldRenderContentStyles && (
          <RenderContentStyles
            cssCode={state.useContent?.data?.cssCode}
            customFonts={state.useContent?.data?.customFonts}
          />
        )}
        <RenderBlocks
          blocks={markMutable(state.useContent?.data?.blocks)}
          key={state.forceReRenderCount}
        />
      </div>
    </Show>
  );
}
