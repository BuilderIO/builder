import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useContext } from "react";
import { isEditing } from "../functions/is-editing";
import RenderBlock from "./render-block.lite";

export default function RenderBlocks(props) {
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
      onClick={(event) => onClick}
      onMouseEnter={(event) => onMouseEnter}
      className={"builder-blocks" + (!props.blocks?.length ? " no-blocks" : "")}
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
