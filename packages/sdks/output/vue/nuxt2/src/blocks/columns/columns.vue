<template>
  <div class="builder-columns div-2fnk003dqad" :style="columnsCssVars">
    <div
      class="builder-column div-2fnk003dqad-2"
      v-for="(column, index) in columns"
      :style="{
        width: getColumnCssWidth(index),
        marginLeft: `${index === 0 ? 0 : getGutterSize()}px`,
        ...columnCssVars,
      }"
      :key="index"
    >
      <render-blocks :blocks="column.blocks"></render-blocks>
    </div>
  </div>
</template>
<script>
import RenderBlocks from "../../components/render-blocks";

export default {
  name: "builder-columns",
  components: { "render-blocks": async () => RenderBlocks },
  props: ["space", "columns", "stackColumnsAt", "reverseColumnsWhenStacked"],

  computed: {
    columnsCssVars() {
      const flexDir =
        this.stackColumnsAt === "never"
          ? "inherit"
          : this.reverseColumnsWhenStacked
          ? "column-reverse"
          : "column";
      return {
        "--flex-dir": flexDir,
        "--flex-dir-tablet": this.maybeApplyForTablet(flexDir),
      };
    },
    columnCssVars() {
      const width = "100%";
      const marginLeft = "0";
      return {
        "--column-width": width,
        "--column-margin-left": marginLeft,
        "--column-width-tablet": this.maybeApplyForTablet(width),
        "--column-margin-left-tablet": this.maybeApplyForTablet(marginLeft),
      };
    },
  },

  methods: {
    getGutterSize() {
      return typeof this.space === "number" ? this.space || 0 : 20;
    },
    getColumns() {
      return this.columns || [];
    },
    getWidth(index) {
      const columns = this.getColumns();
      return columns[index]?.width || 100 / columns.length;
    },
    getColumnCssWidth(index) {
      const columns = this.getColumns();
      const gutterSize = this.getGutterSize();
      const subtractWidth =
        (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
    },
    maybeApplyForTablet(prop) {
      const _stackColumnsAt = this.stackColumnsAt || "tablet";

      return _stackColumnsAt === "tablet" ? prop : "inherit";
    },
  },
};
</script>
<style scoped>
.div-2fnk003dqad {
  display: flex;
  align-items: stretch;
  line-height: normal;
}
@media (max-width: 999px) {
  .div-2fnk003dqad {
    flex-direction: var(--flex-dir-tablet);
  }
}
@media (max-width: 639px) {
  .div-2fnk003dqad {
    flex-direction: var(--flex-dir);
  }
}
.div-2fnk003dqad-2 {
  flex-grow: 1;
}
@media (max-width: 999px) {
  .div-2fnk003dqad-2 {
    width: var(--column-width-tablet) !important;
    margin-left: var(--column-margin-left-tablet) !important;
  }
}
@media (max-width: 639px) {
  .div-2fnk003dqad-2 {
    width: var(--column-width) !important;
    margin-left: var(--column-margin-left) !important;
  }
}
</style>
