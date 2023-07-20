'use client';
import * as React from "react";

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
import BuilderContext from "../../../context/builder.context.js";
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../../context/types";
import type { BuilderBlock } from "../../../types/builder-block";
import Block from "../block";

function RepeatedBlock(props: Props) {
  const _context = { ...props["_context"] };

  const state = { store: props.repeatContext };

  return (
    <Block
      block={props.block}
      context={state.store}
      registeredComponents={props.registeredComponents}
      _context={_context}
    />
  );
}

export default RepeatedBlock;
