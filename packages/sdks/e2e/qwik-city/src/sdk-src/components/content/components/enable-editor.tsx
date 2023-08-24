import builderContext from '../../../context/builder.context';

import { BuilderContextInterface } from '../../../context/types';

import { evaluate } from '../../../functions/evaluate/index';

import { fastClone } from '../../../functions/fast-clone';

import { fetchOneEntry } from '../../../functions/get-content/index';

import { fetch } from '../../../functions/get-fetch';

import { isBrowser } from '../../../functions/is-browser';

import { isEditing } from '../../../functions/is-editing';

import { isPreviewing } from '../../../functions/is-previewing';

import { createRegisterComponentMessage } from '../../../functions/register-component';

import { _track } from '../../../functions/track/index';

import { getInteractionPropertiesForEvent } from '../../../functions/track/interaction';

import { logger } from '../../../helpers/logger';

import { checkIsDefined } from '../../../helpers/nullable';

import { postPreviewContent } from '../../../helpers/preview-lru-cache/set';

import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../../scripts/init-editing';

import { BuilderContent } from '../../../types/builder-content';

import { ComponentInfo } from '../../../types/components';

import { BuilderComponentStateChange, ContentProps } from '../content.types';

import {
  Fragment,
  Slot,
  component$,
  h,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';

type BuilderEditorProps = Omit<
  ContentProps,
  'customComponents' | 'data' | 'apiVersion' | 'isSsrAbTest'
> & {
  builderContextSignal: BuilderContextInterface;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};
export const mergeNewContent = function mergeNewContent(
  props,
  state,
  elementRef,
  newContent: BuilderContent
) {
  console.log('Merging new content: ', newContent);
  const newContentValue = {
    ...props.builderContextSignal.content,
    ...newContent,
    data: {
      ...props.builderContextSignal.content?.data,
      ...newContent?.data,
    },
    meta: {
      ...props.builderContextSignal.content?.meta,
      ...newContent?.meta,
      breakpoints:
        newContent?.meta?.breakpoints ||
        props.builderContextSignal.content?.meta?.breakpoints,
    },
  };
  props.builderContextSignal.content = newContentValue;
};
export const processMessage = function processMessage(
  props,
  state,
  elementRef,
  event: MessageEvent
) {
  const { data } = event;
  console.log('Recieved Message: ', data.type);
  if (data) {
    switch (data.type) {
      case 'builder.configureSdk': {
        const messageContent = data.data;
        const { breakpoints, contentId } = messageContent;
        if (
          !contentId ||
          contentId !== props.builderContextSignal.content?.id
        ) {
          return;
        }
        if (breakpoints) {
          mergeNewContent(props, state, elementRef, {
            meta: {
              breakpoints,
            },
          });
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
        console.log('Recieved Content Update: ', {
          key,
          propsModel: props.model,
          messageContent,
        });
        const contentData = messageContent.data;
        if (key === props.model) {
          console.log('Updating Content: ', contentData);
          mergeNewContent(props, state, elementRef, contentData);
          state.forceReRenderCount = state.forceReRenderCount + 1; // This is a hack to force Qwik to re-render.
        }

        break;
      }
    }
  }
};
export const evaluateJsCode = function evaluateJsCode(
  props,
  state,
  elementRef
) {
  // run any dynamic JS code attached to content
  const jsCode = props.builderContextSignal.content?.data?.jsCode;
  if (jsCode) {
    evaluate({
      code: jsCode,
      context: props.context || {},
      localState: undefined,
      rootState: props.builderContextSignal.rootState,
      rootSetState: props.builderContextSignal.rootSetState,
    });
  }
};
export const onClick = function onClick(props, state, elementRef, event: any) {
  if (props.builderContextSignal.content) {
    const variationId = props.builderContextSignal.content?.testVariationId;
    const contentId = props.builderContextSignal.content?.id;
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
};
export const evalExpression = function evalExpression(
  props,
  state,
  elementRef,
  expression: string
) {
  return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
    evaluate({
      code: group,
      context: props.context || {},
      localState: undefined,
      rootState: props.builderContextSignal.rootState,
      rootSetState: props.builderContextSignal.rootSetState,
    })
  );
};
export const handleRequest = function handleRequest(
  props,
  state,
  elementRef,
  {
    url,
    key,
  }: {
    key: string;
    url: string;
  }
) {
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      const newState = {
        ...props.builderContextSignal.rootState,
        [key]: json,
      };
      props.builderContextSignal.rootSetState?.(newState);
      state.httpReqsData[key] = true;
    })
    .catch((err) => {
      console.error('error fetching dynamic data', url, err);
    });
};
export const runHttpRequests = function runHttpRequests(
  props,
  state,
  elementRef
) {
  const requests: {
    [key: string]: string;
  } = props.builderContextSignal.content?.data?.httpRequests ?? {};
  Object.entries(requests).forEach(([key, url]) => {
    if (url && (!state.httpReqsData[key] || isEditing())) {
      const evaluatedUrl = evalExpression(props, state, elementRef, url);
      handleRequest(props, state, elementRef, {
        url: evaluatedUrl,
        key,
      });
    }
  });
};
export const emitStateUpdate = function emitStateUpdate(
  props,
  state,
  elementRef
) {
  if (isEditing()) {
    window.dispatchEvent(
      new CustomEvent<BuilderComponentStateChange>(
        'builder:component:stateChange',
        {
          detail: {
            state: fastClone(props.builderContextSignal.rootState),
            ref: {
              name: props.model,
            },
          },
        }
      )
    );
  }
};
export const EnableEditor = component$((props: BuilderEditorProps) => {
  const elementRef = useSignal<Element>();
  const state = useStore<any>(
    {
      canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,
      clicked: false,
      forceReRenderCount: 0,
      httpReqsData: {},
      lastUpdated: 0,
      shouldSendResetCookie: false,
    },
    { deep: true }
  );
  useContextProvider(builderContext, props.builderContextSignal);
  useVisibleTask$(() => {
    if (!props.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      );
    }
    if (isBrowser()) {
      if (isEditing()) {
        state.forceReRenderCount = state.forceReRenderCount + 1;
        window.addEventListener(
          'message',
          processMessage.bind(null, props, state, elementRef)
        );
        registerInsertMenu();
        setupBrowserForEditing({
          ...(props.locale
            ? {
                locale: props.locale,
              }
            : {}),
          ...(props.includeRefs
            ? {
                includeRefs: props.includeRefs,
              }
            : {}),
          ...(props.enrich
            ? {
                enrich: props.enrich,
              }
            : {}),
        });
        Object.values<ComponentInfo>(
          props.builderContextSignal.componentInfos
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent);
          window.parent?.postMessage(message, '*');
        });
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate.bind(null, props, state, elementRef)
        );
      }
      if (props.builderContextSignal.content) {
        const variationId = props.builderContextSignal.content?.testVariationId;
        const contentId = props.builderContextSignal.content?.id;
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
          fetchOneEntry({
            model: props.model,
            apiKey: props.apiKey,
            apiVersion: props.builderContextSignal.apiVersion,
          }).then((content) => {
            if (content) {
              mergeNewContent(props, state, elementRef, content);
            }
          });
        }
      }
      evaluateJsCode(props, state, elementRef);
      runHttpRequests(props, state, elementRef);
      emitStateUpdate(props, state, elementRef);
    }
  });
  useTask$(({ track }) => {
    track(() => props.content);
    if (props.content) {
      mergeNewContent(props, state, elementRef, props.content);
    }
  });
  useTask$(({ track }) => {
    track(() => state.shouldSendResetCookie);
  });
  useTask$(({ track }) => {
    track(() => props.builderContextSignal.content?.data?.jsCode);
    track(() => props.builderContextSignal.rootState);
    evaluateJsCode(props, state, elementRef);
  });
  useTask$(({ track }) => {
    track(() => props.builderContextSignal.content?.data?.httpRequests);
    runHttpRequests(props, state, elementRef);
  });
  useTask$(({ track }) => {
    track(() => props.builderContextSignal.rootState);
    emitStateUpdate(props, state, elementRef);
  });

  return (
    <>
      {props.builderContextSignal.content ? (
        <div
          key={state.forceReRenderCount}
          ref={elementRef}
          onClick$={(event) => onClick(props, state, elementRef, event)}
          builder-content-id={props.builderContextSignal.content?.id}
          builder-model={props.model}
          {...{}}
          {...(props.showContent
            ? {}
            : {
                hidden: true,
                'aria-hidden': true,
              })}
          class={props.classNameProp}
        >
          <Slot></Slot>
        </div>
      ) : null}
    </>
  );
});

export default EnableEditor;
