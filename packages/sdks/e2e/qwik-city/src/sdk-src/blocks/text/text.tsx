import { Fragment, component$, h } from "@builder.io/qwik";

export interface TextProps {
  text: string;
}
export const Text = component$((props: TextProps) => {
  return (
    <span
      class="builder-text"
      dangerouslySetInnerHTML={props.text}
      style={{
        outline: "none",
      }}
    ></span>
  );
});

export default Text;
