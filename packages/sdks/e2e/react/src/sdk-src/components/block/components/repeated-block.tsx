"use client";
import * as React from "react";
import { useState, useContext } from "react";

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
};
import BuilderContext from "../../../context/builder.context.js";
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from "../../../context/types.js";
import type { BuilderBlock } from "../../../types/builder-block.js";
import Block from "../block";

function RepeatedBlock(props: Props) {
  const [store, setStore] = useState(() => props.repeatContext);

  return (
    <BuilderContext.Provider value={store}>
      <Block
        block={props.block}
        context={store}
        registeredComponents={props.registeredComponents}
      />
    </BuilderContext.Provider>
  );
}

export default RepeatedBlock;
