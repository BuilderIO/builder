import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useContext } from "react";
import BuilderContext from "../../context/builder.context.js";
import ComponentsContext from "../../context/components.context.js";
import Block from "../block/block";
import BlockStyles from "../block/components/block-styles";
import BlocksWrapper from "./blocks-wrapper";

function Blocks(props) {
  const builderContext = useContext(BuilderContext);

  const componentsContext = useContext(ComponentsContext);

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <Block
              key={"render-block-" + block.id}
              block={block}
              context={props.context || builderContext}
              registeredComponents={
                props.registeredComponents ||
                componentsContext.registeredComponents
              }
            />
          ))}
        </>
      ) : null}

      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <BlockStyles
              key={"block-style-" + block.id}
              block={block}
              context={props.context || builderContext}
            />
          ))}
        </>
      ) : null}
    </BlocksWrapper>
  );
}

export default Blocks;
