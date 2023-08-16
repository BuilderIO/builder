import { Fragment, Slot, component$, h } from "@builder.io/qwik";

export interface FragmentProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}
export const FragmentComponent = component$((props: FragmentProps) => {
  return (
    <span>
      <Slot></Slot>
    </span>
  );
});

export default FragmentComponent;
