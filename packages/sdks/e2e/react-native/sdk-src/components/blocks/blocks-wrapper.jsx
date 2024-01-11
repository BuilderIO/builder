import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { isEditing } from "../../functions/is-editing.js";

function BlocksWrapper(props) {
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
      {...{
        dataSet: {
          class: className(),
        },
      }}
      style={{
        ...styles.view1,
        ...props.styleProp,
      }}
      onClick={(event) => onClick()}
      onMouseEnter={(event) => onMouseEnter()}
      onKeyPress={(event) => onClick()}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  view1: { display: "flex", flexDirection: "column", alignItems: "stretch" },
});

export default BlocksWrapper;
