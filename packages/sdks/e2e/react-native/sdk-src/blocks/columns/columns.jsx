import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState } from "react";
import Blocks from "../../components/blocks/blocks";
import InlinedStyles from "../../components/inlined-styles";
import { getSizesForBreakpoints } from "../../constants/device-sizes.js";
import { TARGET } from "../../constants/target.js";
import { deoptSignal } from "../../functions/deopt.js";

function Columns(props) {
  const [gutterSize, setGutterSize] = useState(() =>
    typeof props.space === "number" ? props.space || 0 : 20
  );

  const [cols, setCols] = useState(() => props.columns || []);

  const [stackAt, setStackAt] = useState(
    () => props.stackColumnsAt || "tablet"
  );

  function getWidth(index) {
    return cols[index]?.width || 100 / cols.length;
  }

  function getColumnCssWidth(index) {
    const subtractWidth = (gutterSize * (cols.length - 1)) / cols.length;
    return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
  }

  function getTabletStyle({ stackedStyle, desktopStyle }) {
    return stackAt === "tablet" ? stackedStyle : desktopStyle;
  }

  function getMobileStyle({ stackedStyle, desktopStyle }) {
    return stackAt === "never" ? desktopStyle : stackedStyle;
  }

  const [flexDir, setFlexDir] = useState(() =>
    props.stackColumnsAt === "never"
      ? "row"
      : props.reverseColumnsWhenStacked
      ? "column-reverse"
      : "column"
  );

  function columnsCssVars() {
    return {
      flexDirection: flexDir,
    };
  }

  function columnCssVars(index) {
    const gutter = index === 0 ? 0 : gutterSize;
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = "100%";
    const mobileMarginLeft = 0;
    const marginLeftKey = "margin-left";
    return {
      marginLeft: props.stackColumnsAt === "never" ? gutter : 0,
    };
  }

  function getWidthForBreakpointSize(size) {
    const breakpointSizes = getSizesForBreakpoints(
      props.builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  }

  function columnsStyles() {
    return `
        @media (max-width: ${getWidthForBreakpointSize("medium")}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize("small")}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
  }

  return (
    <View
      style={{
        ...styles.view1,
        ...columnsCssVars(),
      }}
      {...{
        dataSet: {
          "builder-block-name": "builder-columns",
        },
      }}
    >
      {TARGET !== "reactNative" ? (
        <>
          <InlinedStyles styles={columnsStyles()} />
        </>
      ) : null}

      {props.columns?.map((column, index) => (
        <View
          style={{
            ...styles.view2,
            ...columnCssVars(index),
          }}
          {...{
            dataSet: {
              "builder-block-name": "builder-column",
            },
          }}
          key={index}
        >
          <Blocks
            path={`component.options.columns.${index}.blocks`}
            parent={props.builderBlock.id}
            styleProp={{
              flexGrow: "1",
            }}
            context={props.builderContext}
            registeredComponents={props.builderComponents}
            blocks={column.blocks}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  view1: { display: "flex" },
  view2: { display: "flex", flexDirection: "column", alignItems: "stretch" },
});

export default Columns;
