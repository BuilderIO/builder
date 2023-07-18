import type { BuilderContextInterface } from '../../../context/types.js';
import { evaluate } from '../../../functions/evaluate.js';
import { fetch } from '../../../functions/get-fetch.js';
import { isBrowser } from '../../../functions/is-browser.js';
import { isEditing } from '../../../functions/is-editing.js';
import { createRegisterComponentMessage } from '../../../functions/register-component.js';
import { _track } from '../../../functions/track/index.js';
import builderContext from '../../../context/builder.context.lite';
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
} from '@builder.io/mitosis';
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../../scripts/init-editing.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import { getInteractionPropertiesForEvent } from '../../../functions/track/interaction.js';
import type {
  ContentProps,
  BuilderComponentStateChange,
} from '../content.types.js';
import { TARGET } from '../../../constants/target.js';
import { logger } from '../../../helpers/logger.js';
import type { ComponentInfo } from '../../../types/components.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
});

type BuilderEditorProps = Omit<
  ContentProps,
  'customComponents' | 'content' | 'data' | 'apiVersion' | 'isSsrAbTest'
> & {
  builderContextSignal: Signal<BuilderContextInterface>;
  children?: any;
};

export default function EnableEditor(props: BuilderEditorProps) {
  const elementRef = useRef<HTMLDivElement>();
  const state = useStore({
    canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,

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
                state: props.builderContextSignal.value.rootState,
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

  onMount(() => {
    if (!props.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      );
    }

    if (isBrowser()) {
      if (isEditing()) {
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
          canTrack: state.canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

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

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        state.emitStateUpdate
      );
    }
  });

  // TODO: `else` message for when there is no content passed, or maybe a console.log
  return (
    <Show when={props.builderContextSignal.value.content}>
      <div
        ref={elementRef}
        onClick={(event) => state.onClick(event)}
        builder-content-id={props.builderContextSignal.value.content?.id}
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
        {...(props.showContent ? {} : { hidden: true, 'aria-hidden': true })}
      >
        {props.children}
      </div>
    </Show>
  );
}
