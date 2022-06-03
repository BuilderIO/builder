import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createMutable } from "solid-js/store";
import { TARGET } from "../constants/target.js";

function RenderInlinedStyles(props) {
  const state = createMutable({
    get injectedStyleScript() {
      return `<${state.tagName}>${props.styles}</${state.tagName}>`;
    },

    get tagName() {
      // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
      // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
      return "sty" + "le";
    }

  });
  return <Show fallback={<Dynamic component={state.tagName}>{props.styles}</Dynamic>} when={TARGET === "svelte"}>
      <div innerHTML={state.injectedStyleScript}></div>
    </Show>;
}

export default RenderInlinedStyles;