import { createMutable } from "solid-js/store";
import RenderInlinedStyles from "../render-inlined-styles";

function BlockStyles(props) {
  const state = createMutable({
    camelToKebabCase(string) {
      return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
    },

    get css() {
      // TODO: media queries
      const styleObject = props.block.responsiveStyles?.large;

      if (!styleObject) {
        return "";
      }

      let str = `.${props.block.id} {`;

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
  return <RenderInlinedStyles styles={state.css}></RenderInlinedStyles>;
}

export default BlockStyles;