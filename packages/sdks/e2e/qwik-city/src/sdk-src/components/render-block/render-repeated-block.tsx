import BuilderContext from "../../context/builder.context";

import { BuilderContextInterface } from "../../context/types.js";

import { BuilderBlock } from "../../types/builder-block";

import RenderBlock from "./render-block";

import {
  Fragment,
  component$,
  h,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
};

/**
 * We can't make this a generic `ProvideContext` function because Vue 2 won't support root slots, e.g.
 *
 * ```vue
 * <template>
 *  <slot></slot>
 * </template>
 * ```
 */
export const RenderRepeatedBlock = component$((props: Props) => {
  useContextProvider(
    BuilderContext,
    useStore({
      content: props.repeatContext.content,
      state: props.repeatContext.state,
      context: props.repeatContext.context,
      apiKey: props.repeatContext.apiKey,
      registeredComponents: props.repeatContext.registeredComponents,
      inheritedStyles: props.repeatContext.inheritedStyles,
    })
  );

  return (
    <RenderBlock
      block={props.block}
      context={props.repeatContext}
    ></RenderBlock>
  );
});

export default RenderRepeatedBlock;
