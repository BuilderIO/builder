'use client';
import * as React from 'react';
import { useContext, useState } from 'react';
import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components';
import { TARGET } from '../../constants/target';
import ComponentsContext from '../../context/components.context';
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from '../../context/types';
import {
  components,
  serializeComponentInfo,
} from '../../functions/register-component';
import type { ComponentInfo } from '../../types/components';
import type { Dictionary } from '../../types/typescript';
import Blocks from '../blocks/blocks';
import { getUpdateVariantVisibilityScript } from '../content-variants/helpers';
import InlinedScript from '../inlined-script';
import EnableEditor from './components/enable-editor';
import ContentStyles from './components/styles';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './content.helpers';
import type { ContentProps } from './content.types';
import { wrapComponentRef } from './wrap-component-ref';

function ContentComponent(props: ContentProps) {
  const [scriptStr, setScriptStr] = useState(() =>
    getUpdateVariantVisibilityScript({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      variationId: props.content?.testVariationId!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id!,
    })
  );

  function contentSetState(newRootState: BuilderRenderState) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      rootState: newRootState,
    }));
  }

  const [registeredComponents, setRegisteredComponents] = useState(() =>
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
      (acc, { component, ...info }) => ({
        ...acc,
        [info.name]: {
          component: component,
          ...serializeComponentInfo(info),
        },
      }),
      {}
    )
  );

  const [builderContextSignal, setBuilderContextSignal] = useState(() => ({
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
    rootSetState: contentSetState,
    context: props.context || {},
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    componentInfos: [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce<Dictionary<ComponentInfo>>(
      (acc, { component: _, ...info }) => ({
        ...acc,
        [info.name]: serializeComponentInfo(info),
      }),
      {}
    ),
    inheritedStyles: {},
  }));

  return (
    <ComponentsContext.Provider
      value={{
        registeredComponents: registeredComponents,
      }}
    >
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
        {...{
          setBuilderContextSignal: setBuilderContextSignal,
        }}
      >
        {props.isSsrAbTest ? (
          <>
            <InlinedScript scriptStr={scriptStr} />
          </>
        ) : null}

        {TARGET !== 'reactNative' ? (
          <>
            <ContentStyles
              contentId={builderContextSignal.content?.id}
              cssCode={builderContextSignal.content?.data?.cssCode}
              customFonts={builderContextSignal.content?.data?.customFonts}
            />
          </>
        ) : null}

        <Blocks
          blocks={builderContextSignal.content?.data?.blocks}
          context={builderContextSignal}
          registeredComponents={registeredComponents}
        />
      </EnableEditor>
    </ComponentsContext.Provider>
  );
}

export default ContentComponent;
