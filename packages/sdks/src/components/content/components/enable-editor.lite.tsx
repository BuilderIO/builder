import type { Signal } from '@builder.io/mitosis';
import {
  Show,
  onEvent,
  onMount,
  onUnMount,
  onUpdate,
  setContext,
  useMetadata,
  useRef,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import builderContext from '../../../context/builder.context.lite.js';
import type { BuilderContextInterface } from '../../../context/types.js';
import { evaluate } from '../../../functions/evaluate/index.js';
import { fastClone } from '../../../functions/fast-clone.js';
import { fetchOneEntry } from '../../../functions/get-content/index.js';
import { fetch } from '../../../functions/get-fetch.js';
import { isBrowser } from '../../../functions/is-browser.js';
import { isEditing } from '../../../functions/is-editing.js';
import { isPreviewing } from '../../../functions/is-previewing.js';
import { createRegisterComponentMessage } from '../../../functions/register-component.js';
import { _track } from '../../../functions/track/index.js';
import { getInteractionPropertiesForEvent } from '../../../functions/track/interaction.js';
import { getDefaultCanTrack } from '../../../helpers/canTrack.js';
import { logger } from '../../../helpers/logger.js';
import { postPreviewContent } from '../../../helpers/preview-lru-cache/set.js';
import { createEditorListener } from '../../../helpers/subscribe-to-editor.js';
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../../scripts/init-editing.js';
import type { BuilderContent } from '../../../types/builder-content.js';
import type { ComponentInfo } from '../../../types/components.js';
import type { Dictionary } from '../../../types/typescript.js';
import { triggerAnimation } from '../../block/animator.js';
import DynamicDiv from '../../dynamic-div.lite.jsx';
import type {
  BuilderComponentStateChange,
  ContentProps,
} from '../content.types.js';
import { getWrapperClassName } from './styles.helpers.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
  elementTag: 'state.ContentWrapper',
});

type BuilderEditorProps = Omit<
  ContentProps,
  | 'customComponents'
  | 'apiVersion'
  | 'isSsrAbTest'
  | 'blocksWrapper'
  | 'blocksWrapperProps'
  | 'isNestedRender'
  | 'linkComponent'
> & {
  builderContextSignal: Signal<BuilderContextInterface>;
  setBuilderContextSignal?: (signal: any) => any;
  children?: any;
};

export default function EnableEditor(props: BuilderEditorProps) {
  /**
   * This var name is hard-coded in some Mitosis Plugins. Do not change.
   */
  const elementRef = useRef<HTMLDivElement>();
  const state = useStore({
    mergeNewRootState(newData: Dictionary<any>) {
      const combinedState = {
        ...props.builderContextSignal.value.rootState,
        ...newData,
      };

      if (props.builderContextSignal.value.rootSetState) {
        props.builderContextSignal.value.rootSetState?.(combinedState);
      } else {
        props.builderContextSignal.value.rootState = combinedState;
      }
    },
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
    get showContentProps() {
      return props.showContent ? {} : { hidden: true, 'aria-hidden': true };
    },
    ContentWrapper: useTarget({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reactNative: props.contentWrapper || ScrollView,
      angular: props.contentWrapper || DynamicDiv,
      default: props.contentWrapper || 'div',
    }),
    processMessage(event: MessageEvent): void {
      return createEditorListener({
        model: props.model,
        trustedHosts: props.trustedHosts,
        callbacks: {
          configureSdk: (messageContent) => {
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
          },
          animation: (animation) => {
            triggerAnimation(animation);
          },
          contentUpdate: (newContent) => {
            state.mergeNewContent(newContent);
          },
        },
      })(event);
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
          /**
           * We don't want to cache the result of the JS code, since it's arbitrary side effect code.
           */
          enableCache: false,
        });
      }
    },
    httpReqsData: {} as { [key: string]: boolean },
    httpReqsPending: {} as { [key: string]: boolean },

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

    runHttpRequests() {
      const requests: { [key: string]: string } =
        props.builderContextSignal.value.content?.data?.httpRequests ?? {};

      Object.entries(requests).forEach(([key, url]) => {
        if (!url) return;

        // request already in progress
        if (state.httpReqsPending[key]) return;

        // request already completed, and not in edit mode
        if (state.httpReqsData[key] && !isEditing()) return;

        state.httpReqsPending[key] = true;
        const evaluatedUrl = url.replace(/{{([^}]+)}}/g, (_match, group) =>
          String(
            evaluate({
              code: group,
              context: props.context || {},
              localState: undefined,
              rootState: props.builderContextSignal.value.rootState,
              rootSetState: props.builderContextSignal.value.rootSetState,
              enableCache: true,
            })
          )
        );

        fetch(evaluatedUrl)
          .then((response) => response.json())
          .then((json) => {
            state.mergeNewRootState({ [key]: json });
            state.httpReqsData[key] = true;
          })
          .catch((err) => {
            console.error('error fetching dynamic data', url, err);
          })
          .finally(() => {
            state.httpReqsPending[key] = false;
          });
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

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
      window.removeEventListener(
        'builder:component:stateChangeListenerActivated',
        state.emitStateUpdate
      );
    }
  });

  onEvent(
    'initeditingbldr',
    () => {
      window.addEventListener('message', state.processMessage);

      registerInsertMenu();
      setupBrowserForEditing({
        ...(props.locale ? { locale: props.locale } : {}),
        ...(props.enrich ? { enrich: props.enrich } : {}),
        ...(props.trustedHosts ? { trustedHosts: props.trustedHosts } : {}),
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
    },
    elementRef,
    true
  );

  onEvent(
    'initpreviewingbldr',
    () => {
      const searchParams = new URL(location.href).searchParams;
      const builderPreviewSearchParams = searchParams.get('builder.preview');
      if (builderPreviewSearchParams === 'BUILDER_STUDIO') {
        searchParams.set('builder.preview', props.model || '');
      }

      const searchParamPreviewModel = searchParams.get('builder.preview');

      console.log('searchParamPreviewModel', searchParamPreviewModel);

      if (builderPreviewSearchParams === 'BUILDER_STUDIO') {
        searchParams.set(
          `builder.overrides.${searchParamPreviewModel}`,
          props.content?.id || ''
        );
      }

      const searchParamPreviewId = searchParams.get(
        `builder.overrides.${searchParamPreviewModel}`
      );
      console.log('searchParamPreviewId', searchParamPreviewId);
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
        (searchParamPreviewModel === props.model ||
          searchParamPreviewModel === 'BUILDER_STUDIO') &&
        previewApiKey === props.apiKey &&
        (!props.content || searchParamPreviewId === props.content.id)
      ) {
        fetchOneEntry({
          model: props.model,
          apiKey: props.apiKey,
          apiVersion: props.builderContextSignal.value.apiVersion,
        }).then((content) => {
          console.log('CONTENT', content);
          if (content) {
            state.mergeNewContent(content);
          }
        });
      }
    },
    elementRef,
    true
  );

  onMount(() => {
    if (isBrowser()) {
      if (isEditing()) {
        useTarget({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          solid: () => INJECT_EDITING_HOOK_HERE,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          reactNative: () => INJECT_EDITING_HOOK_HERE,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          react: () => INJECT_EDITING_HOOK_HERE,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          angular: () => INJECT_EDITING_HOOK_HERE,
          default: () => {
            if (elementRef) {
              elementRef.dispatchEvent(new CustomEvent('initeditingbldr'));
            }
          },
        });
      }

      const shouldTrackImpression = useTarget({
        qwik:
          elementRef.attributes.getNamedItem('shouldTrack')?.value === 'true',
        default:
          props.builderContextSignal.value.content &&
          getDefaultCanTrack(props.canTrack),
      });

      if (shouldTrackImpression) {
        const variationId = useTarget({
          qwik: elementRef.attributes.getNamedItem('variationId')?.value,
          default: props.builderContextSignal.value.content?.testVariationId,
        });
        const contentId = useTarget({
          qwik: elementRef.attributes.getNamedItem('contentId')?.value,
          default: props.builderContextSignal.value.content?.id,
        });
        const apiKeyProp = useTarget({
          qwik: elementRef.attributes.getNamedItem('apiKey')?.value,
          default: props.apiKey,
        });

        _track({
          type: 'impression',
          canTrack: true,
          contentId,
          apiKey: apiKeyProp!,
          variationId: variationId !== contentId ? variationId : undefined,
        });
      }

      /**
       * Override normal content in preview mode.
       * We ignore this when editing, since the edited content is already being sent from the editor via post messages.
       */
      if (isPreviewing() && !isEditing()) {
        useTarget({
          rsc: () => {},
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          solid: () => INJECT_PREVIEWING_HOOK_HERE,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          reactNative: () => INJECT_PREVIEWING_HOOK_HERE,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          react: () => INJECT_PREVIEWING_HOOK_HERE,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore

          angular: () => INJECT_PREVIEWING_HOOK_HERE,
          default: () => {
            if (elementRef) {
              elementRef.dispatchEvent(new CustomEvent('initpreviewingbldr'));
            }
          },
        });
      }
    }
  });

  onMount(
    () => {
      if (!props.apiKey) {
        logger.error(
          'No API key provided to `Content` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
        );
      }

      state.evaluateJsCode();
      state.runHttpRequests();
      state.emitStateUpdate();
    },
    { onSSR: true }
  );

  onUpdate(() => {
    state.evaluateJsCode();
  }, [props.builderContextSignal.value.content?.data?.jsCode]);

  onUpdate(() => {
    state.runHttpRequests();
  }, [props.builderContextSignal.value.content?.data?.httpRequests]);

  onUpdate(() => {
    state.emitStateUpdate();
  }, [props.builderContextSignal.value.rootState]);

  onUpdate(() => {
    if (props.data) {
      state.mergeNewRootState(props.data);
    }
  }, [props.data]);

  onUpdate(() => {
    if (props.locale) {
      state.mergeNewRootState({ locale: props.locale });
    }
  }, [props.locale]);

  return (
    <Show when={props.builderContextSignal.value.content}>
      <state.ContentWrapper
        {...useTarget({
          qwik: {
            apiKey: props.apiKey,
            contentId: props.builderContextSignal.value.content?.id,
            variationId:
              props.builderContextSignal.value.content?.testVariationId,
            shouldTrack: String(
              props.builderContextSignal.value.content &&
                getDefaultCanTrack(props.canTrack)
            ),
          },
          default: {},
        })}
        ref={elementRef}
        onClick={(event: any) => state.onClick(event)}
        builder-content-id={props.builderContextSignal.value.content?.id}
        builder-model={props.model}
        className={getWrapperClassName(
          props.content?.testVariationId || props.content?.id
        )}
        {...useTarget({
          reactNative: {
            // currently, we can't set the actual ID here.
            // we don't need it right now, we just need to identify content divs for testing.
            dataSet: { 'builder-content-id': '' },
          },
          default: {},
        })}
        {...state.showContentProps}
        {...props.contentWrapperProps}
      >
        {props.children}
      </state.ContentWrapper>
    </Show>
  );
}
