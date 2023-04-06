import { TARGET } from "../constants/target.js";

import { Fragment, component$, h, useComputed$ } from "@builder.io/qwik";

interface Props {
  styles: string;
}
export const RenderInlinedStyles = component$((props: Props) => {
  const state: any = {};
  const tag = useComputed$(() => {
    // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
    // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
    return "sty" + "le";
  });
  const injectedStyleScript = useComputed$(() => {
    return `<${tag.value}>${props.styles}</${tag.value}>`;
  });
  return (
    <>
      {TARGET === "svelte" || TARGET === "qwik" ? (
        <style dangerouslySetInnerHTML={props.styles}></style>
      ) : (
        <tag.value>{props.styles}</tag.value>
      )}
    </>
  );
});

export default RenderInlinedStyles;
