import * as React from "react";

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
import BuilderContext from "../../../context/builder.context";
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../../context/types";
import type { BuilderBlock } from "../../../types/builder-block";
import Block from "../block";

function RepeatedBlock(props: Props) {
  const store = props.repeatContext;

  return (
    <Block
      block={props.block}
      context={store}
      registeredComponents={props.registeredComponents}
    />
  );
}

export default RepeatedBlock;
