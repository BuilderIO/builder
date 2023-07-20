"use client";
import * as React from "react";
import { useState, useEffect } from "react";

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
  const [shouldRenderVariants, setShouldRenderVariants] = useState(() =>
    checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
  );

  function variantScriptStr() {
    return getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ""
    );
  }

  function hideVariantsStyleString() {
    return getVariants(props.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join("");
  }

  useEffect(() => {
    /**
     * We unmount the non-winning variants post-hydration in Vue.
     */
    null;
  }, []);

  return (
    <>
      {!props.__isNestedRender && TARGET !== "reactNative" ? (
        <>
          <InlinedScript scriptStr={getScriptString()} />
        </>
      ) : null}

      {shouldRenderVariants ? (
        <>
          <InlinedStyles
            id={`variants-styles-${props.content?.id}`}
            styles={hideVariantsStyleString()}
          />
          <InlinedScript scriptStr={variantScriptStr()} />
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
              isSsrAbTest={shouldRenderVariants}
            />
          ))}
        </>
      ) : null}

      <ContentComponent
        {...{}}
        content={
          shouldRenderVariants
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
        isSsrAbTest={shouldRenderVariants}
      />
    </>
  );
}

export default ContentVariants;
