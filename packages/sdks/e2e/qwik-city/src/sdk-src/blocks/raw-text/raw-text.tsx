import { Fragment, component$, h } from "@builder.io/qwik";

export interface RawTextProps {
  attributes?: any;
  text?: string;
}
export const RawText = component$((props: RawTextProps) => {
  return (
    <span
      dangerouslySetInnerHTML={props.text?.toString() || ""}
      class={props.attributes.class}
    ></span>
  );
});

export default RawText;
