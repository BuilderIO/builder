import * as React from "react";
import type { FragmentProps } from "./fragment.types.js";

function FragmentComponent(props: FragmentProps) {
  return <span>{props.children}</span>;
}

export default FragmentComponent;
