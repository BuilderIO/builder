'use client';
import * as React from 'react';
import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components';
import type {
  BuilderRenderState,
  RegisteredComponents,
} from '../../context/types';
import {
  components,
  serializeComponentInfo,
} from '../../functions/register-component';
import Blocks from '../blocks/blocks';
import ContentStyles from './components/styles';
import type { ContentProps } from './content.types';
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './content.helpers';
import { TARGET } from '../../constants/target';
import { getRenderContentScriptString } from '../content-variants/helpers';
import EnableEditor from './components/enable-editor';
import InlinedScript from '../inlined-script';
import type { ComponentInfo } from '../../types/components';
import type { Dictionary } from '../../types/typescript';

function ContentComponent(props: ContentProps) {
  const _context = { ...props['_context'] };

  const state = {
    scriptStr: getRenderContentScriptString({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      variationId: props.content?.testVariationId!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id!,
    }),
    contentSetState(newRootState: BuilderRenderState) {
      state.builderContextSignal.rootState = newRootState;
    },
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
      (acc, { component, ...info }) => ({
        ...acc,
        [info.name]: {
          component,
          ...serializeComponentInfo(info),
        },
      }),
      {}
    ),
    builderContextSignal: {
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
      rootSetState: state.contentSetState,
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
    },
  };

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
      builderContextSignal={state.builderContextSignal}
      {...{
        setBuilderContextSignal,
      }}
      _context={_context}
    >
      {props.isSsrAbTest ? (
        <>
          <InlinedScript scriptStr={state.scriptStr} _context={_context} />
        </>
      ) : null}

      {TARGET !== 'reactNative' ? (
        <>
          <ContentStyles
            contentId={state.builderContextSignal.content?.id}
            cssCode={state.builderContextSignal.content?.data?.cssCode}
            customFonts={state.builderContextSignal.content?.data?.customFonts}
            _context={_context}
          />
        </>
      ) : null}

      <Blocks
        blocks={state.builderContextSignal.content?.data?.blocks}
        context={state.builderContextSignal}
        registeredComponents={state.registeredComponents}
        _context={_context}
      />
    </EnableEditor>
  );
}

export default ContentComponent;
