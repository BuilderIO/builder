import {
  Fragment,
  component$,
  h,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

export interface CustomCodeProps {
  code: string;
  replaceNodes?: boolean;
}
export const findAndRunScripts = function findAndRunScripts(
  props,
  state,
  elem
) {
  // TODO: Move this function to standalone one in '@builder.io/utils'
  if (
    elem.value &&
    elem.value.getElementsByTagName &&
    typeof window !== "undefined"
  ) {
    const scripts = elem.value.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.src) {
        if (state.scriptsInserted.includes(script.src)) {
          continue;
        }
        state.scriptsInserted.push(script.src);
        const newScript = document.createElement("script");
        newScript.async = true;
        newScript.src = script.src;
        document.head.appendChild(newScript);
      } else if (
        !script.type ||
        [
          "text/javascript",
          "application/javascript",
          "application/ecmascript",
        ].includes(script.type)
      ) {
        if (state.scriptsRun.includes(script.innerText)) {
          continue;
        }
        try {
          state.scriptsRun.push(script.innerText);
          new Function(script.innerText)();
        } catch (error) {
          console.warn("`CustomCode`: Error running script:", error);
        }
      }
    }
  }
};
export const CustomCode = component$((props: CustomCodeProps) => {
  const elem = useSignal<Element>();
  const state = useStore<any>({ scriptsInserted: [], scriptsRun: [] });
  useVisibleTask$(() => {
    findAndRunScripts(props, state, elem);
  });

  return (
    <div
      ref={elem}
      class={
        "builder-custom-code" + (props.replaceNodes ? " replace-nodes" : "")
      }
      dangerouslySetInnerHTML={props.code}
    ></div>
  );
});

export default CustomCode;
