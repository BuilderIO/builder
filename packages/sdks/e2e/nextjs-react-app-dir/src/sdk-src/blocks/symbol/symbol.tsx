import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}
/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface SymbolProps extends BuilderComponentsProp {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  attributes?: any;
  inheritState?: boolean;
}

import ContentVariants from "../../components/content-variants/content-variants";
import type { BuilderContent } from "../../types/builder-content.js";
import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from "../../types/builder-props.js";
import { filterAttrs } from "../helpers.js";
import { setAttrs } from "../helpers.js";
import { fetchContent } from "./symbol.helpers.js";
import type { Nullable } from "../../types/typescript.js";

async function Symbol(props: PropsWithBuilderData<SymbolProps>) {
  const className = function className() {
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
  };
  const contentToUse = (props.symbol?.content ||
    (await fetchContent({
      symbol: props.symbol,
      builderContextValue: props.builderContext,
    }))) as Nullable<BuilderContent>;

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
