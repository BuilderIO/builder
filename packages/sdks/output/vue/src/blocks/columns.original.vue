<template>
  <div class="builder-columns div-2oo96by5l6a">
    <template :key="index" v-for="(column, index) in columns">
      <div
        class="builder-column div-2oo96by5l6a-2"
        :style="{
          width: getColumnCssWidth(index),
          marginLeft: index === 0 ? 0 : getGutterSize(),
        }"
      >
        <render-blocks :blocks="column.blocks"></render-blocks>
      </div>
    </template>
  </div>
</template>
<script>
import RenderBlocks from "../components/render-blocks.lite";

export default {
  name: "Columns",
  components: { RenderBlocks },
  props: ["space", "columns"],

  data: () => ({ RenderBlocks }),

  methods: {
    getGutterSize() {
      return typeof this.space === "number" ? this.space || 0 : 20;
    },
    getColumns() {
      return this.columns || [];
    },
    getWidth(index) {
      const columns = this.getColumns();
      return (columns[index] && columns[index].width) || 100 / columns.length;
    },
    getColumnCssWidth(index) {
      const columns = this.getColumns();
      const gutterSize = this.getGutterSize();
      const subtractWidth =
        (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
    },
  },
};
</script>
<style scoped>
.div-2oo96by5l6a {
  display: flex;
  align-items: stretch;
  line-height: normal;
}
.div-2oo96by5l6a-2 {
  flex-grow: 1;
}
</style>
