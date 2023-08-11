import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useContext } from "react";
import RenderBlocks from "../../components/render-blocks";
import { getSizesForBreakpoints } from "../../constants/device-sizes";
import RenderInlinedStyles from "../../components/render-inlined-styles";
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context.js";

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
    if (TARGET === "reactNative") {
      return {
        flexDirection: flexDir,
      };
    }
    return {
      "--flex-dir": flexDir,
      "--flex-dir-tablet": getTabletStyle({
        stackedStyle: flexDir,
        desktopStyle: "row",
      }),
    };
  }

  function columnCssVars(index) {
    const gutter = index === 0 ? 0 : gutterSize;
    if (TARGET === "reactNative") {
      return {
        marginLeft: props.stackColumnsAt === "never" ? gutter : 0,
      };
    }
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = "100%";
    const mobileMarginLeft = 0;
    return {
      width,
      "margin-left": gutterPixels,
      "--column-width-mobile": getMobileStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      "--column-margin-left-mobile": getMobileStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
      "--column-width-tablet": getTabletStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      "--column-margin-left-tablet": getTabletStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
    };
  }

  function getWidthForBreakpointSize(size) {
    const breakpointSizes = getSizesForBreakpoints(
      builderContext.content?.meta?.breakpoints || {}
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

  const builderContext = useContext(BuilderContext);

  return (
    <View
      style={columnsCssVars()}
      dataSet={{
        "builder-block-name": "builder-columns",
      }}
    >
      {TARGET !== "reactNative" ? (
        <>
          <RenderInlinedStyles styles={columnsStyles()} />
        </>
      ) : null}

      {props.columns?.map((column, index) => (
        <View
          style={columnCssVars(index)}
          dataSet={{
            "builder-block-name": "builder-column",
          }}
          key={index}
        >
          <RenderBlocks
            blocks={column.blocks}
            path={`component.options.columns.${index}.blocks`}
            parent={props.builderBlock.id}
            styleProp={{
              flexGrow: "1",
            }}
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
