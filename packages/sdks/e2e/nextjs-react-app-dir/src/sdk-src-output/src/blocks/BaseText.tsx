'use client';
import * as React from "react";

export interface BaseTextProps {
  text: string;
}

import BuilderContext from "../context/builder.context.js";

function BaseText(props: BaseTextProps) {
  const _context = { ...props["_context"] };

  const builderContext = _context["BuilderContext"];

  return (
    <span style={builderContext.inheritedStyles as any}>{props.text}</span>
  );
}

export default BaseText;
