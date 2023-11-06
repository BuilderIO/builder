import { createSignal } from "solid-js";

import BuilderContext from "../../../context/builder.context.js";
import Block from "../block";

function RepeatedBlock(props) {
  const [store, setStore] = createSignal(props.repeatContext);

  return (
    <BuilderContext.Provider value={store()}>
      <Block
        block={props.block}
        context={store()}
        registeredComponents={props.registeredComponents}
      ></Block>
    </BuilderContext.Provider>
  );
}

export default RepeatedBlock;
