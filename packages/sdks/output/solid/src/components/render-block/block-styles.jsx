import { useContext, Show } from "solid-js";
import { createMutable } from "solid-js/store";
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import RenderInlinedStyles from "../render-inlined-styles";

function BlockStyles(props) {
  const state = createMutable({
    get useBlock() {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context
      });
    },

    camelToKebabCase(string) {
      return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
    },

    get css() {
      // TODO: media queries
      const styleObject = state.useBlock.responsiveStyles?.large;

      if (!styleObject) {
        return "";
      }

      let str = `.${state.useBlock.id} {`;

      for (const key in styleObject) {
        const value = styleObject[key];

        if (typeof value === "string") {
          str += `${state.camelToKebabCase(key)}: ${value};`;
        }
      }

      str += "}";
      return str;
    }

  });
  const builderContext = useContext(BuilderContext);
  return <Show when={TARGET === "vue" || TARGET === "svelte"}>
      <RenderInlinedStyles styles={state.css}></RenderInlinedStyles>
    </Show>;
}

export default BlockStyles;