import { Fragment, component$, h } from "@builder.io/qwik";

export interface ButtonProps {
  attributes?: any;
  text?: string;
}
export const SubmitButton = component$((props: ButtonProps) => {
  return (
    <button type="submit" {...props.attributes}>
      {props.text}
    </button>
  );
});

export default SubmitButton;
