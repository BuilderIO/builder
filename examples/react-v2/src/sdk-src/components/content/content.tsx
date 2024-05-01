"use client";
import * as React from "react";
import { useState, useContext } from "react";
import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components.js";
import { TARGET } from "../../constants/target.js";
import ComponentsContext from "../../context/components.context.js";
import type {
  BuilderContextInterface,
  BuilderRenderState,
  RegisteredComponents,
} from "../../context/types.js";
import { serializeComponentInfo } from "../../functions/register-component.js";
import type { ComponentInfo } from "../../types/components.js";
import type { Dictionary } from "../../types/typescript.js";
import Blocks from "../blocks/blocks";
import { getUpdateVariantVisibilityScript } from "../content-variants/helpers.js";
import InlinedScript from "../inlined-script";
import EnableEditor from "./components/enable-editor";
import ContentStyles from "./components/styles";
import {
  getContentInitialValue,
  getRootStateInitialValue,
} from "./content.helpers.js";
import type { ContentProps } from "./content.types.js";
import { wrapComponentRef } from "./wrap-component-ref.js";
import DynamicDiv from "../dynamic-div";

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
    rootState: getRootStateInitialValue({
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
      ...(props.customComponents || []),
    ].reduce<Dictionary<ComponentInfo>>(
      (acc, { component: _, ...info }) => ({
        ...acc,
        [info.name]: serializeComponentInfo(info),
      }),
      {}
    ),
    inheritedStyles: {},
    BlocksWrapper: props.blocksWrapper || "div",
    BlocksWrapperProps: props.blocksWrapperProps || {},
  }));

  return (
    <ComponentsContext.Provider
      value={{
        registeredComponents: registeredComponents,
      }}
    >
      <EnableEditor
        content={props.content}
        data={props.data}
        model={props.model}
        context={props.context}
        apiKey={props.apiKey}
        canTrack={props.canTrack}
        locale={props.locale}
        enrich={props.enrich}
        showContent={props.showContent}
        builderContextSignal={builderContextSignal}
        contentWrapper={props.contentWrapper}
        contentWrapperProps={props.contentWrapperProps}
        linkComponent={props.linkComponent}
        trustedHosts={props.trustedHosts}
        {...{
          setBuilderContextSignal: setBuilderContextSignal,
        }}
      >
        {props.isSsrAbTest ? (
          <>
            <InlinedScript
              id="builderio-variant-visibility"
              scriptStr={scriptStr}
            />
          </>
        ) : null}

        {TARGET !== "reactNative" ? (
          <>
            <ContentStyles
              isNestedRender={props.isNestedRender}
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
          linkComponent={props.linkComponent}
        />
      </EnableEditor>
    </ComponentsContext.Provider>
  );
}

export default ContentComponent;
