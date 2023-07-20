'use client';
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
import BuilderContext from "../../context/builder.context.js";
import { getContent } from "../../functions/get-content/index";
import type { BuilderContent } from "../../types/builder-content";
import { logger } from "../../helpers/logger";
import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from "../../types/builder-props";
import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

function Symbol(props: PropsWithBuilderData<SymbolProps>) {
  const _context = { ...props["_context"] };

  const state = {
    className: [
      ...[props.attributes.class],
      "builder-symbol",
      props.symbol?.inline ? "builder-inline-symbol" : undefined,
      props.symbol?.dynamic || props.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" "),
    contentToUse: props.symbol?.content,
    fetchContent() {
      /**
       * If:
       * - we have a symbol prop
       * - yet it does not have any content
       * - and we have not already stored content from before
       * - and it has a model name
       *
       * then we want to re-fetch the symbol content.
       */
      if (
        !state.contentToUse &&
        props.symbol?.model &&
        // This is a hack, we should not need to check for this, but it is needed for Svelte.
        builderContext?.apiKey
      ) {
        getContent({
          model: props.symbol.model,
          apiKey: builderContext.apiKey,
          apiVersion: builderContext.apiVersion,
          ...(props.symbol?.entry && {
            query: {
              id: props.symbol.entry,
            },
          }),
        })
          .then((response) => {
            if (response) {
              state.contentToUse = response;
            }
          })
          .catch((err) => {
            logger.error("Could not fetch symbol content: ", err);
          });
      }
    },
  };

  const builderContext = _context["BuilderContext"];

  return (
    <div {...{}} {...props.attributes} className={state.className}>
      <ContentVariants
        __isNestedRender={true}
        apiVersion={builderContext.apiVersion}
        apiKey={builderContext.apiKey!}
        context={builderContext.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...builderContext.localState,
          ...state.contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.contentToUse}
        _context={_context}
      />
    </div>
  );
}

export default Symbol;
