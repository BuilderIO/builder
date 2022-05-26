import { For } from "solid-js";
import { createMutable } from "solid-js/store";
import { css } from "solid-styled-components";
import RenderBlocks from "../../components/render-blocks";

function Columns(props) {
  const state = createMutable({
    getGutterSize() {
      return typeof props.space === "number" ? props.space || 0 : 20;
    },

    getColumns() {
      return props.columns || [];
    },

    getWidth(index) {
      const columns = this.getColumns();
      return columns[index]?.width || 100 / columns.length;
    },

    getColumnCssWidth(index) {
      const columns = this.getColumns();
      const gutterSize = this.getGutterSize();
      const subtractWidth = gutterSize * (columns.length - 1) / columns.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
    },

    maybeApplyForTablet(prop) {
      const _stackColumnsAt = props.stackColumnsAt || "tablet";

      return _stackColumnsAt === "tablet" ? prop : "inherit";
    },

    get columnsCssVars() {
      const flexDir = props.stackColumnsAt === "never" ? "inherit" : props.reverseColumnsWhenStacked ? "column-reverse" : "column";
      return {
        "--flex-dir": flexDir,
        "--flex-dir-tablet": this.maybeApplyForTablet(flexDir)
      };
    },

    get columnCssVars() {
      const width = "100%";
      const marginLeft = "0";
      return {
        "--column-width": width,
        "--column-margin-left": marginLeft,
        "--column-width-tablet": this.maybeApplyForTablet(width),
        "--column-margin-left-tablet": this.maybeApplyForTablet(marginLeft)
      };
    }

  });
  return <div class={css({
    display: "flex",
    alignItems: "stretch",
    lineHeight: "normal",
    "@media (max-width: 999px)": {
      flexDirection: "var(--flex-dir-tablet)"
    },
    "@media (max-width: 639px)": {
      flexDirection: "var(--flex-dir)"
    }
  })} style={state.columnsCssVars}>
      <For each={props.columns}>
        {(column, _index) => {
        const index = _index();

        return <div class={css({
          flexGrow: "1",
          "@media (max-width: 999px)": {
            width: "var(--column-width-tablet) !important",
            marginLeft: "var(--column-margin-left-tablet) !important"
          },
          "@media (max-width: 639px)": {
            width: "var(--column-width) !important",
            marginLeft: "var(--column-margin-left) !important"
          }
        })} style={{
          width: state.getColumnCssWidth(index),
          "margin-left": `${index === 0 ? 0 : state.getGutterSize()}px`,
          ...state.columnCssVars
        }} key={index}>
              <RenderBlocks blocks={column.blocks}></RenderBlocks>
            </div>;
      }}
      </For>
    </div>;
}

export default Columns;