"use client";
import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useEffect } from "react";
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

function ContentVariants(props) {
  const [shouldRenderVariants, setShouldRenderVariants] = useState(() =>
    checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
  );

  function variantScriptStr() {
    return getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.testVariationId,
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
     * We unmount the non-winning variants post-hydration in Vue.
     */
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
        content={defaultContent()}
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
