"use client";
import * as React from "react";
import { useState, useEffect } from "react";

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  isNestedRender?: boolean;
};
import { TARGET } from "../../constants/target.js";
import { handleABTestingSync } from "../../helpers/ab-tests.js";
import { getDefaultCanTrack } from "../../helpers/canTrack.js";
import ContentComponent from "../content/content";
import InlinedScript from "../inlined-script";
import InlinedStyles from "../inlined-styles";
import type { ContentVariantsPrps } from "./content-variants.types.js";
import {
  checkShouldRenderVariants,
  getInitVariantsFnsScriptString,
  getUpdateCookieAndStylesScript,
  getVariants,
} from "./helpers.js";

function ContentVariants(props: VariantsProviderProps) {
  const [shouldRenderVariants, setShouldRenderVariants] = useState(() =>
    checkShouldRenderVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
  );

  function updateCookieAndStylesScriptStr() {
    return getUpdateCookieAndStylesScript(
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

  function defaultContent() {
    return shouldRenderVariants
      ? {
          ...props.content,
          testVariationId: props.content?.id,
        }
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        });
  }

  useEffect(() => {
    /**
     * For Solid/Svelte: we unmount the non-winning variants post-hydration.
     */
  }, []);

  return (
    <>
      {!props.isNestedRender && TARGET !== "reactNative" ? (
        <>
          <InlinedScript
            id="builderio-init-variants-fns"
            scriptStr={getInitVariantsFnsScriptString()}
          />
        </>
      ) : null}

      {shouldRenderVariants ? (
        <>
          <InlinedStyles
            id="builderio-variants"
            styles={hideVariantsStyleString()}
          />
          <InlinedScript
            id="builderio-variants-visibility"
            scriptStr={updateCookieAndStylesScriptStr()}
          />
          {getVariants(props.content)?.map((variant) => (
            <ContentComponent
              isNestedRender={props.isNestedRender}
              key={variant.testVariationId}
              content={variant}
              showContent={false}
              model={props.model}
              data={props.data}
              context={props.context}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              customComponents={props.customComponents}
              linkComponent={props.linkComponent}
              canTrack={props.canTrack}
              locale={props.locale}
              enrich={props.enrich}
              isSsrAbTest={shouldRenderVariants}
              blocksWrapper={props.blocksWrapper}
              blocksWrapperProps={props.blocksWrapperProps}
              contentWrapper={props.contentWrapper}
              contentWrapperProps={props.contentWrapperProps}
              trustedHosts={props.trustedHosts}
            />
          ))}
        </>
      ) : null}

      <ContentComponent
        isNestedRender={props.isNestedRender}
        {...{}}
        content={defaultContent()}
        showContent={true}
        model={props.model}
        data={props.data}
        context={props.context}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        customComponents={props.customComponents}
        linkComponent={props.linkComponent}
        canTrack={props.canTrack}
        locale={props.locale}
        enrich={props.enrich}
        isSsrAbTest={shouldRenderVariants}
        blocksWrapper={props.blocksWrapper}
        blocksWrapperProps={props.blocksWrapperProps}
        contentWrapper={props.contentWrapper}
        contentWrapperProps={props.contentWrapperProps}
        trustedHosts={props.trustedHosts}
      />
    </>
  );
}

export default ContentVariants;
