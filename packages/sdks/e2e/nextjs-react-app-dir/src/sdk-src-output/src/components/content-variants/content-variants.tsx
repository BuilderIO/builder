'use client';
import * as React from "react";

type VariantsProviderProps = ContentVariantsProps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  __isNestedRender?: boolean;
};
import {
  checkShouldRunVariants,
  getScriptString,
  getVariants,
  getVariantsScriptString,
} from "./helpers";
import ContentComponent from "../content/content";
import { getDefaultCanTrack } from "../../helpers/canTrack";
import InlinedStyles from "../inlined-styles";
import { handleABTestingSync } from "../../helpers/ab-tests";
import InlinedScript from "../inlined-script";
import { TARGET } from "../../constants/target";
import type { ContentVariantsProps } from "./content-variants.types";

function ContentVariants(props: VariantsProviderProps) {
  const _context = { ...props["_context"] };

  const state = {
    shouldRenderVariants: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),
    variantScriptStr: getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ""
    ),
    hideVariantsStyleString: getVariants(props.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join(""),
  };

  return (
    <>
      {!props.__isNestedRender && TARGET !== "reactNative" ? (
        <>
          <InlinedScript scriptStr={getScriptString()} _context={_context} />
        </>
      ) : null}

      {state.shouldRenderVariants ? (
        <>
          <InlinedStyles
            id={`variants-styles-${props.content?.id}`}
            styles={state.hideVariantsStyleString}
            _context={_context}
          />
          <InlinedScript
            scriptStr={state.variantScriptStr}
            _context={_context}
          />
          {getVariants(props.content)?.map((variant) => (
            <ContentComponent
              key={variant.testVariationId}
              content={variant}
              showContent={false}
              classNameProp={undefined}
              model={props.model}
              data={props.data}
              context={props.context}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              customComponents={props.customComponents}
              canTrack={props.canTrack}
              locale={props.locale}
              includeRefs={props.includeRefs}
              enrich={props.enrich}
              isSsrAbTest={state.shouldRenderVariants}
              _context={_context}
            />
          ))}
        </>
      ) : null}

      <ContentComponent
        {...{}}
        content={
          state.shouldRenderVariants
            ? props.content
            : handleABTestingSync({
                item: props.content,
                canTrack: getDefaultCanTrack(props.canTrack),
              })
        }
        classNameProp={`variant-${props.content?.id}`}
        showContent={true}
        model={props.model}
        data={props.data}
        context={props.context}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        customComponents={props.customComponents}
        canTrack={props.canTrack}
        locale={props.locale}
        includeRefs={props.includeRefs}
        enrich={props.enrich}
        isSsrAbTest={state.shouldRenderVariants}
        _context={_context}
      />
    </>
  );
}

export default ContentVariants;
