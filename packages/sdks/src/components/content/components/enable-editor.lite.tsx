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
  useTarget,
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
import { logger } from '../../../helpers/logger.js';
import type { ComponentInfo } from '../../../types/components.js';
import { getContent } from '../../../functions/get-content/index.js';
import { isPreviewing } from '../../../functions/is-previewing.js';
import type { BuilderContent } from '../../../types/builder-content.js';

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
    canTrackToUse: checkIsDefined(props.canTrack) ? props.canTrack : true,
    forceReRenderCount: 0,
    mergeNewContent(newContent: BuilderContent) {
      props.builderContextSignal.value.content = {
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
          case 'builder.hardReset': {
            useTarget({
              rsc: () => {
                const lastUpdatedAutosave = parseInt(
                  data.data.lastUpdatedAutosave
                );

                console.log('HARD RESET', { lastUpdatedAutosave });

                const lastUpdatedToUse =
                  !isNaN(lastUpdatedAutosave) &&
                  lastUpdatedAutosave > state.lastUpdated
                    ? lastUpdatedAutosave
                    : state.lastUpdated;
                state.lastUpdated = lastUpdatedToUse;

                console.log('HARD RESET', {
                  shouldSendResetCookie: state.shouldSendResetCookie,
                });
                if (state.shouldSendResetCookie) {
                  console.log('HARD RESET: refreshing.');
                  document.cookie = `builder.hardReset=${lastUpdatedToUse};max-age=100`;
                  state.shouldSendResetCookie = false;

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  router.refresh();
                } else {
                  console.log('HARD RESET: not refreshing.');
                }
              },
            });
            break;
          }

          case 'builder.patchUpdates': {
            useTarget({
              rsc: () => {
                const patches = data.data.data;

                for (const contentId of Object.keys(patches)) {
                  const patchesForBlock = patches[contentId];

                  // TO-DO: fix scenario where we end up with -Infinity
                  const getLastIndex = () =>
                    Math.max(
                      ...document.cookie
                        .split(';')
                        .filter((x) => x.trim().startsWith(contentIdKeyPrefix))
                        .map((x) => {
                          const parsedIndex = parseInt(
                            x.split('=')[0].split(contentIdKeyPrefix)[1]
                          );
                          return isNaN(parsedIndex) ? 0 : parsedIndex;
                        })
                    ) || 0;

                  const contentIdKeyPrefix = `builder.patch.${contentId}.`;

                  // get last index of patch for this block
                  const lastIndex = getLastIndex();

                  const cookie = {
                    name: `${contentIdKeyPrefix}${lastIndex + 1}`,
                    value: encodeURIComponent(JSON.stringify(patchesForBlock)),
                  };

                  // remove hard reset cookie just in case it was set in a prior update.
                  document.cookie = `builder.hardReset=no;max-age=0`;
                  document.cookie = `${cookie.name}=${cookie.value};max-age=30`;

                  const newCookieValue = document.cookie
                    .split(';')
                    .find((x) => x.trim().startsWith(cookie.name))
                    ?.split('=')[1];

                  if (newCookieValue !== cookie.value) {
                    console.warn('Cookie did not save correctly.');
                    console.log('Clearing all Builder patch cookies...');

                    window.parent?.postMessage(
                      { type: 'builder.patchUpdatesFailed', data: data.data },
                      '*'
                    );

                    document.cookie
                      .split(';')
                      .filter((x) => x.trim().startsWith(contentIdKeyPrefix))
                      .forEach((x) => {
                        document.cookie = `${x.split('=')[0]}=;max-age=0`;
                      });

                    state.shouldSendResetCookie = true;
                  } else {
                    console.log('cookie saved correctly');

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    router.refresh();
                  }
                }
              },
            });
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

  onUpdate(() => {
    useTarget({
      rsc: () => {
        if (!props.content) return;

        const lastUpdatedAutosave = props.content.meta?.lastUpdatedAutosave;

        const hardResetCookie = document.cookie
          .split(';')
          .find((x) => x.trim().startsWith('builder.hardReset'));
        const hardResetCookieValue = hardResetCookie?.split('=')[1];

        if (!hardResetCookieValue) return;

        if (
          lastUpdatedAutosave &&
          parseInt(hardResetCookieValue) <= lastUpdatedAutosave
        ) {
          console.log('got fresh content! 🎉');
          document.cookie = `builder.hardReset=;max-age=0`;

          window.parent?.postMessage(
            {
              type: 'builder.freshContentFetched',
              data: {
                contentId: props.content.id,
                lastUpdated: lastUpdatedAutosave,
              },
            },
            '*'
          );
        } else {
          console.log(
            'hard reset cookie is newer than lastUpdatedAutosave, refreshing'
          );
          document.cookie = `builder.hardReset=${hardResetCookieValue};max-age=100`;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          router.refresh();
        }
      },

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
          canTrack: state.canTrackToUse,
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
              getContent({
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

  // TODO: `else` message for when there is no content passed, or maybe a console.log
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
