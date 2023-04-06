import { isJsScript } from "./helpers.js";

import {
  Fragment,
  component$,
  h,
  useSignal,
  useStore,
  useTask$,
} from "@builder.io/qwik";

export interface EmbedProps {
  content: string;
}
export const findAndRunScripts = function findAndRunScripts(
  props,
  state,
  elem
) {
  if (!elem.value || !elem.value.getElementsByTagName) return;
  const scripts = elem.value.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src && !state.scriptsInserted.includes(script.src)) {
      state.scriptsInserted.push(script.src);
      const newScript = document.createElement("script");
      newScript.async = true;
      newScript.src = script.src;
      document.head.appendChild(newScript);
    } else if (
      isJsScript(script) &&
      !state.scriptsRun.includes(script.innerText)
    ) {
      try {
        state.scriptsRun.push(script.innerText);
        new Function(script.innerText)();
      } catch (error) {
        console.warn("`Embed`: Error running script:", error);
      }
    }
  }
};
export const Embed = component$((props: EmbedProps) => {
  const elem = useSignal<Element>();
  const state = useStore<any>({
    ranInitFn: false,
    scriptsInserted: [],
    scriptsRun: [],
  });
  useTask$(({ track }) => {
    track(() => elem.value);
    track(() => state.ranInitFn);
    if (elem.value && !state.ranInitFn) {
      state.ranInitFn = true;
      findAndRunScripts(props, state, elem);
    }
  });

  return (
    <div
      class="builder-embed"
      ref={elem}
      dangerouslySetInnerHTML={props.content}
    ></div>
  );
});

export default Embed;
