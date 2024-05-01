"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import ContentVariants from "../../components/content-variants/index.js";
import type { BuilderContent } from "../../types/builder-content.js";
import { filterAttrs } from "../helpers.js";
import { getClassPropName } from "../../functions/get-class-prop-name.js";
import type { Nullable } from "../../types/typescript.js";
import { setAttrs } from "../helpers.js";
import { fetchSymbolContent } from "./symbol.helpers.js";
import type { SymbolProps } from "./symbol.types.js";
import DynamicDiv from "../../components/dynamic-div";

function Symbol(props: SymbolProps) {
  function blocksWrapper() {
    return "div";
  }

  function contentWrapper() {
    return "div";
  }

  function className() {
    return [
      ...[props.attributes[getClassPropName()]],
      "builder-symbol",
      props.symbol?.inline ? "builder-inline-symbol" : undefined,
      props.symbol?.dynamic || props.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const [contentToUse, setContentToUse] = useState(() => props.symbol?.content);

  function setContent() {
    if (contentToUse) return;
    fetchSymbolContent({
      symbol: props.symbol,
      builderContextValue: props.builderContext,
    }).then((newContent) => {
      if (newContent) {
        setContentToUse(newContent);
      }
    });
  }

  useEffect(() => {}, []);

  useEffect(() => {
    setContent();
  }, [props.symbol]);

  return (
    <div {...{}} {...props.attributes} {...{}} className={className()}>
      <ContentVariants
        isNestedRender={true}
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey!}
        context={{
          ...props.builderContext.context,
          symbolId: props.builderBlock?.id,
        }}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse}
        linkComponent={props.builderLinkComponent}
        blocksWrapper={blocksWrapper()}
        contentWrapper={contentWrapper()}
      />
    </div>
  );
}

export default Symbol;
