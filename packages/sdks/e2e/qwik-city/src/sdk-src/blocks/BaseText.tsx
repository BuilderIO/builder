import BuilderContext from "../context/builder.context";

import { Fragment, component$, h, useContext } from "@builder.io/qwik";

export interface BaseTextProps {
  text: string;
}
export const BaseText = component$((props: BaseTextProps) => {
  const builderContext = useContext(BuilderContext);

  return (
    <span style={builderContext.inheritedStyles as any}>{props.text}</span>
  );
});

export default BaseText;
