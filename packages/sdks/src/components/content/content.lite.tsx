import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from '../../context/types.js';
import { components } from '../../functions/register-component.js';
import Blocks from '../blocks/blocks.lite';
import ContentStyles from './components/styles.lite';
import {
  Show,
  useStore,
  useMetadata,
  useState,
  onUpdate,
  onMount,
  onUnMount,
} from '@builder.io/mitosis';
import type { ContentProps } from './content.types.js';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './content.helpers.js';
import { TARGET } from '../../constants/target.js';
import { getRenderContentScriptString } from '../content-variants/helpers.js';
import { useTarget } from '@builder.io/mitosis';
import EnableEditor from './components/enable-editor.lite';
import type { BuilderContent } from '../../types/builder-content.js';
import { getContent } from '../../functions/get-content/index.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import { logger } from '../../helpers/logger.js';
import InlinedScript from '../inlined-script.lite';
import { wrapComponentRef } from './wrap-component-ref.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
});

export default function ContentComponent(props: ContentProps) {
  const state = useStore({
    forceReRenderCount: 0,
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
          case 'builder.patchUpdates': {
            // TODO
            break;
          }
        }
      }
    },

    scriptStr: getRenderContentScriptString({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      variationId: props.content?.testVariationId!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id!,
    }),

    registeredComponents: [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce<RegisteredComponents>(
      (acc, { component, ...curr }) => ({
        ...acc,
        [curr.name]: {
          component: useTarget({
            vue3: wrapComponentRef(component),
            default: component,
          }),
          ...curr,
        },
      }),
      {}
    ),
  });

  const [builderContextSignal] = useState<BuilderContextInterface>(
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
      componentInfos: Object.values(
        [
          ...getDefaultRegisteredComponents(),
          // While this `components` object is deprecated, we must maintain support for it.
          // Since users are able to override our default components, we need to make sure that we do not break such
          // existing usage.
          // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
          // which is the new standard way of providing custom components, and must therefore take precedence.
          ...components,
          ...(props.customComponents || []),
        ].reduce<RegisteredComponents>(
          (acc, info) => ({
            ...acc,
            [info.name]: info,
          }),
          {}
        )
      ).reduce(
        (acc, { component: _, ...info }) => ({
          ...acc,
          [info.name]: info,
        }),
        {}
      ),
      inheritedStyles: {},
    },
    { reactive: true }
  );

  onUpdate(() => {
    if (props.content) {
      state.mergeNewContent(props.content);
    }
  }, [props.content]);

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
    }
  });

  onUnMount(() => {
    if (isBrowser()) {
      window.removeEventListener('message', state.processMessage);
    }
  });
  return (
    <Show when={builderContextSignal.value.content}>
      <EnableEditor
        key={state.forceReRenderCount}
        model={props.model}
        context={props.context}
        apiKey={props.apiKey}
        canTrack={props.canTrack}
        locale={props.locale}
        includeRefs={props.includeRefs}
        enrich={props.enrich}
        classNameProp={props.classNameProp}
        showContent={props.showContent}
        builderContextSignal={builderContextSignal}
      >
        <Show when={props.isSsrAbTest}>
          <InlinedScript scriptStr={state.scriptStr} />
        </Show>
        <Show when={TARGET !== 'reactNative'}>
          <ContentStyles
            contentId={builderContextSignal.value.content?.id}
            cssCode={builderContextSignal.value.content?.data?.cssCode}
            customFonts={builderContextSignal.value.content?.data?.customFonts}
          />
        </Show>
        <Blocks
          blocks={builderContextSignal.value.content?.data?.blocks}
          context={builderContextSignal}
          registeredComponents={state.registeredComponents}
        />
      </EnableEditor>
    </Show>
  );
}
