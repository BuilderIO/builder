import { Fragment, component$, h } from "@builder.io/qwik";

export interface RawTextProps {
  attributes?: any;
  text?: string;
  // builderBlock?: any;
}
export const RawText = component$((props: RawTextProps) => {
  return (
    <span
      class={props.attributes?.class || props.attributes?.className}
      dangerouslySetInnerHTML={props.text || ""}
    ></span>
  );
});

export default RawText;
