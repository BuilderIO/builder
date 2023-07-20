import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components';
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from '../../context/types';
import {
  components,
  serializeComponentInfo,
} from '../../functions/register-component';
import Blocks from '../blocks/blocks.lite';
import ContentStyles from './components/styles.lite';
import { Show, useStore, useMetadata, useState } from '@builder.io/mitosis';
import type { ContentProps } from './content.types';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './content.helpers';
import { TARGET } from '../../constants/target';
import { getRenderContentScriptString } from '../content-variants/helpers';
import { useTarget } from '@builder.io/mitosis';
import EnableEditor from './components/enable-editor.lite';
import InlinedScript from '../inlined-script.lite';
import { wrapComponentRef } from './wrap-component-ref';
import type { ComponentInfo } from '../../types/components';
import type { Dictionary } from '../../types/typescript';

useMetadata({
  qwik: {
    hasDeepStore: true,
  },
});

export default function ContentComponent(props: ContentProps) {
  const state = useStore({
    get scriptStr() {
      return getRenderContentScriptString({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        variationId: props.content?.testVariationId!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
        contentId: props.content?.id!,
      });
    },
    contentSetState: (newRootState: BuilderRenderState) => {
      builderContextSignal.value.rootState = newRootState;
    },

    get registeredComponents() {
      return [
        ...getDefaultRegisteredComponents(),
        // While this `components` object is deprecated, we must maintain support for it.
        // Since users are able to override our default components, we need to make sure that we do not break such
        // existing usage.
        // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
        // which is the new standard way of providing custom components, and must therefore take precedence.
        ...components,
        ...(props.customComponents || []),
      ].reduce<RegisteredComponents>(
        (acc, { component, ...info }) => ({
          ...acc,
          [info.name]: {
            component: useTarget({
              vue3: wrapComponentRef(component),
              default: component,
            }),
            ...serializeComponentInfo(info),
          },
        }),
        {}
      );
    },

    get componentInfos() {
      return Object.keys(state.registeredComponents).reduce<
        Dictionary<ComponentInfo>
      >((acc, key) => {
        const { component: _, ...info } = state.registeredComponents[key];
        return {
          ...acc,
          [key]: info,
        };
      }, {});
    },
  });

  const [builderContextSignal, setBuilderContextSignal] =
    useState<BuilderContextInterface>(
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
        componentInfos: state.componentInfos,
        inheritedStyles: {},
      },
      { reactive: true }
    );

  return (
    <EnableEditor
      content={props.content}
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
      {...useTarget({
        // eslint-disable-next-line object-shorthand
        react: { setBuilderContextSignal: setBuilderContextSignal },
        // eslint-disable-next-line object-shorthand
        reactNative: { setBuilderContextSignal: setBuilderContextSignal },
        // eslint-disable-next-line object-shorthand
        rsc: { setBuilderContextSignal: setBuilderContextSignal },
        // eslint-disable-next-line object-shorthand
        solid: { setBuilderContextSignal: setBuilderContextSignal },
        default: {},
      })}
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
  );
}
