import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components.js';
import type {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { components } from '../../functions/register-component.js';
import Blocks from '../blocks/blocks.lite.jsx';
import RenderContentStyles from './components/render-styles.lite.jsx';
import { Show, useStore, useMetadata, useState } from '@builder.io/mitosis';

import type { RenderContentProps } from './content.types.js';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './content.helpers.js';
import { TARGET } from '../../constants/target.js';
import { getRenderContentScriptString } from '../render-content-variants/helpers.js';
import { wrapComponentRef } from './wrap-component-ref.js';
import { useTarget } from '@builder.io/mitosis';
import BuilderEditing from './builder-editing.lite.jsx';
import type { ComponentInfo } from '../../types/components.js';
import type { Dictionary } from '../../types/typescript.js';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
});

export default function Content(props: RenderContentProps) {
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
      return Object.values(state.customComps).reduce<Dictionary<ComponentInfo>>(
        (acc, { component: _, ...info }) => ({
          ...acc,
          [info.name]: info,
        }),
        {}
      );
    },
  });

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

  return (
    <Show when={builderContextSignal.value.content}>
      <BuilderEditing
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
      >
        <Show when={props.isSsrAbTest}>
          <script innerHTML={state.scriptStr}></script>
        </Show>
        <Show when={TARGET !== 'reactNative'}>
          <RenderContentStyles
            contentId={builderContextSignal.value.content?.id}
            cssCode={builderContextSignal.value.content?.data?.cssCode}
            customFonts={builderContextSignal.value.content?.data?.customFonts}
          />
        </Show>
        <Blocks
          blocks={builderContextSignal.value.content?.data?.blocks}
          context={builderContextSignal}
        />
      </BuilderEditing>
    </Show>
  );
}
