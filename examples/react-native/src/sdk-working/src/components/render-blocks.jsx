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
import BuilderContext from "../context/builder.context.js";
import { isEditing } from "../functions/is-editing.js";
import BlockStyles from "./render-block/block-styles";
import RenderBlock from "./render-block/render-block";

function RenderBlocks(props) {
  function className() {
    return "builder-blocks" + (!props.blocks?.length ? " no-blocks" : "");
  }

  function onClick() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.clickEmptyBlocks",
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        "*"
      );
    }
  }

  function onMouseEnter() {
    if (isEditing() && !props.blocks?.length) {
      window.parent?.postMessage(
        {
          type: "builder.hoverEmptyBlocks",
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        "*"
      );
    }
  }

  const builderContext = useContext(BuilderContext);

  return (
    <ScrollView
      builder-path={props.path}
      builder-parent-id={props.parent}
      dataSet={{
        class: className(),
      }}
      contentContainerStyle={props.styleProp}
      onClick={(event) => onClick()}
      onMouseEnter={(event) => onMouseEnter()}
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <RenderBlock
              key={"render-block-" + block.id}
              block={block}
              context={builderContext}
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
              context={builderContext}
            />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView1: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
});

export default RenderBlocks;
