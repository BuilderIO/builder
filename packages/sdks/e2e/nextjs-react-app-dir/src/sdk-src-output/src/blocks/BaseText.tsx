"use client";
import * as React from "react";
import { useContext } from "react";

export interface BaseTextProps {
  text: string;
}

import BuilderContext from "../context/builder.context";

function BaseText(props: BaseTextProps) {
  const builderContext = useContext(BuilderContext);

  return (
    <span style={builderContext.inheritedStyles as any}>{props.text}</span>
  );
}

export default BaseText;
