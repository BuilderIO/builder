import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { isEditing } from "../functions/is-editing";
import RenderBlock from "./render-block.lite";

export default function RenderBlocks(props) {
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

  return (
    <View
      builder-path={props.path}
      builder-parent-id={props.parent}
      dataSet={{
        class: className(),
      }}
      onClick={(event) => onClick()}
      onMouseEnter={(event) => onMouseEnter()}
      className={className()}
      style={styles.view1}
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <RenderBlock block={block} />
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  view1: { display: "flex", flexDirection: "column", alignItems: "stretch" },
});
