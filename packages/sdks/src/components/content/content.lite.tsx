import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
import type {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { components } from '../../functions/register-component.js';
import Blocks from '../blocks/blocks.lite.jsx';
import ContentStyles from './components/content-styles.lite.jsx';
import {
  Show,
  useStore,
  useMetadata,
  useState,
  onUpdate,
} from '@builder.io/mitosis';

import type { ContentProps } from './content.types.js';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './content.helpers.js';
import { TARGET } from '../../constants/target.js';
import { getRenderContentScriptString } from '../content-variants/helpers.js';
import { wrapComponentRef } from './wrap-component-ref.js';
import { useTarget } from '@builder.io/mitosis';
import EnableEditor from './components/enable-editor.lite.jsx';
import type { ComponentInfo } from '../../types/components.js';
import type { Dictionary } from '../../types/typescript.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
});

export default function Content(props: ContentProps) {
  const state = useStore({
    scriptStr: getRenderContentScriptString({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id!,
      parentContentId: props.parentContentId!,
    }),
    contentSetState: (newRootState: BuilderRenderState) => {
      builderContextSignal.value.rootState = newRootState;
    },

    customComps: [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce<Dictionary<RegisteredComponent>>(
      (acc, info) => ({
        ...acc,
        [info.name]: info,
      }),
      {}
    ),
    get customComponentsInfo() {
      // TO-DO: fix once we remove `useStore<any>` hack in Qwik generator.
      return Object.values(
        state.customComps as Dictionary<RegisteredComponent>
      ).reduce<Dictionary<ComponentInfo>>(
        (acc, { component: _, ...info }) => ({
          ...acc,
          [info.name]: info,
        }),
        {}
      );
    },
  });

  const [builderContextSignal, setBuilderContextSignal] = useState(
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
        react: undefined,
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

  onUpdate(() => {
    if (!builderContextSignal.value.content) {
      builderContextSignal.value.content = getContentInitialValue({
        content: props.content,
        data: props.data,
      });
    }
  }, [props.content, props.data, props.locale]);

  return (
    <Show when={builderContextSignal.value.content}>
      <EnableEditor
        content={props.content}
        model={props.model}
        data={props.data}
        context={props.context}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        customComponents={state.customComponentsInfo}
        canTrack={props.canTrack}
        locale={props.locale}
        includeRefs={props.includeRefs}
        enrich={props.enrich}
        classNameProp={props.classNameProp}
        hideContent={props.hideContent}
        parentContentId={props.parentContentId}
        isSsrAbTest={props.isSsrAbTest}
        builderContextSignal={builderContextSignal}
        setBuilderContextSignal={setBuilderContextSignal}
      >
        <Show when={props.isSsrAbTest}>
          <script innerHTML={state.scriptStr}></script>
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
          components={state.customComps}
        />
      </EnableEditor>
    </Show>
  );
}
