"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import ContentVariants from "../../components/content-variants/content-variants";
import type { BuilderContent } from "../../types/builder-content.js";
import type { PropsWithBuilderData } from "../../types/builder-props.js";
import { filterAttrs } from "../helpers.js";
import type { Nullable } from "../../types/typescript.js";
import { setAttrs } from "../helpers.js";
import { fetchSymbolContent } from "./symbol.helpers.js";
import type { SymbolProps } from "./symbol.types.js";

function Symbol(props: PropsWithBuilderData<SymbolProps>) {
  function className() {
    return [
      ...[props.attributes.className],
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
        __isNestedRender={true}
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey!}
        context={props.builderContext.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse}
      />
    </div>
  );
}

export default Symbol;
