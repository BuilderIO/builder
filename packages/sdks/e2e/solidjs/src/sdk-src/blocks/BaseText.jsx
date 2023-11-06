import { useContext } from "solid-js";

import BuilderContext from "../context/builder.context.js";

function BaseText(props) {
  const builderContext = useContext(BuilderContext);

  return <span style={builderContext.inheritedStyles}>{props.text}</span>;
}

export default BaseText;
