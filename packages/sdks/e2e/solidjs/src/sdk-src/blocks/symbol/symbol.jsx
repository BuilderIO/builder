import { onMount, on, createEffect, createSignal } from "solid-js";

import ContentVariants from "../../components/content-variants/content-variants";
import { filterAttrs } from "../helpers.js";
import { fetchSymbolContent } from "./symbol.helpers.js";

function Symbol(props) {
  const [contentToUse, setContentToUse] = createSignal(props.symbol?.content);

  function className() {
    return [
      ...[props.attributes.class],
      "builder-symbol",
      props.symbol?.inline ? "builder-inline-symbol" : undefined,
      props.symbol?.dynamic || props.dynamic
        ? "builder-dynamic-symbol"
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }

  function setContent() {
    if (contentToUse()) return;
    fetchSymbolContent({
      symbol: props.symbol,
      builderContextValue: props.builderContext,
    }).then((newContent) => {
      if (newContent) {
        setContentToUse(newContent);
      }
    });
  }

  onMount(() => {
    setContent();
  });

  function onUpdateFn_0() {
    setContent();
  }
  createEffect(on(() => [props.symbol], onUpdateFn_0));

  return (
    <div class={className()} {...{}} {...props.attributes} {...{}}>
      <ContentVariants
        __isNestedRender={true}
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey}
        context={props.builderContext.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...contentToUse()?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse()}
      ></ContentVariants>
    </div>
  );
}

export default Symbol;
