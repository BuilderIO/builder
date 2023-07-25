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
} from "./helpers.js";
import ContentComponent from "../content/content";
import { getDefaultCanTrack } from "../../helpers/canTrack.js";
import InlinedStyles from "../inlined-styles";
import { handleABTestingSync } from "../../helpers/ab-tests.js";
import InlinedScript from "../inlined-script";
import { TARGET } from "../../constants/target.js";
import type { ContentVariantsProps } from "./content-variants.types.js";

function ContentVariants(props: VariantsProviderProps) {
  const shouldRenderVariants = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(props.canTrack),
    content: props.content,
  });
  const variantScriptStr = function variantScriptStr() {
    return getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ""
    );
  };
  const hideVariantsStyleString = function hideVariantsStyleString() {
    return getVariants(props.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join("");
  };

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
