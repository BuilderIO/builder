import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import RenderBlocks from "../../components/render-blocks.lite";

export default function Columns(props) {
  function getGutterSize() {
    return typeof props.space === "number" ? props.space || 0 : 20;
  }

  function getColumns() {
    return props.columns || [];
  }

  function getWidth(index) {
    const columns = getColumns();
    return columns[index]?.width || 100 / columns.length;
  }

  function getColumnCssWidth(index) {
    const columns = getColumns();
    const gutterSize = getGutterSize();
    const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
    return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
  }

  function maybeApplyForTablet(prop) {
    const _stackColumnsAt = props.stackColumnsAt || "tablet";

    return _stackColumnsAt === "tablet" ? prop : "inherit";
  }

  function columnsCssVars() {
    const flexDir =
      props.stackColumnsAt === "never"
        ? "inherit"
        : props.reverseColumnsWhenStacked
        ? "column-reverse"
        : "column";
    return {
      "--flex-dir": flexDir,
      "--flex-dir-tablet": maybeApplyForTablet(flexDir),
    };
  }

  function columnCssVars() {
    const width = "100%";
    const marginLeft = "0";
    return {
      "--column-width": width,
      "--column-margin-left": marginLeft,
      "--column-width-tablet": maybeApplyForTablet(width),
      "--column-margin-left-tablet": maybeApplyForTablet(marginLeft),
    };
  }

  return (
    <View style={styles.view1}>
      {props.columns?.map((column, index) => (
        <View style={styles.view2} key={index}>
          <RenderBlocks blocks={column.blocks} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  view1: { display: "flex", alignItems: "stretch" },
  view2: { flexGrow: 1 },
});
