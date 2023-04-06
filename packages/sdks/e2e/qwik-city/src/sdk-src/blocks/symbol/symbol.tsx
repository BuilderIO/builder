import RenderContent from "../../components/render-content/render-content";

import { TARGET } from "../../constants/target";

import BuilderContext from "../../context/builder.context";

import { getContent } from "../../functions/get-content/index.js";

import { BuilderBlock } from "../../types/builder-block.js";

import { BuilderContent } from "../../types/builder-content.js";

import {
  $,
  Fragment,
  component$,
  h,
  useContext,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}
export interface SymbolProps {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  builderBlock?: BuilderBlock;
  attributes?: any;
  inheritState?: boolean;
}
export const fetchContent = function fetchContent(
  props,
  state,
  builderContext
) {
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
      query: {
        id: props.symbol.entry,
      },
    })
      .then((response) => {
        if (response) {
          state.contentToUse = response;
        }
      })
      .catch((err) => {
        console.error("[Builder.io]: Could not fetch symbol content: ", err);
      });
  }
};
export const Symbol = component$((props: SymbolProps) => {
  const builderContext = useContext(BuilderContext);
  const state = useStore<any>({
    className: [
      ...(TARGET === "vue2" || TARGET === "vue3"
        ? Object.keys(props.attributes.class)
        : [props.attributes.class]),
      "builder-symbol",
      props.symbol?.inline ? "builder-inline-symbol" : undefined,
      props.symbol?.dynamic || props.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" "),
    contentToUse: props.symbol?.content
  });


  return (
    <div {...props.attributes} class={state.className}>
      <RenderContent
        apiVersion={builderContext.apiVersion}
        apiKey={builderContext.apiKey!}
        context={builderContext.context}
        customComponents={Object.values(builderContext.registeredComponents)}
        data={props.symbol?.data}
        model={props.symbol?.model}
        content={props.symbol?.content}
      ></RenderContent>
    </div>
  );
});

export default Symbol;
