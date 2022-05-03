<template>
  <div
    v-bind="attributes"
    :dataSet="{
      class: className,
    }"
    :class="_classStringToObject(this.className)"
  >
    <render-content
      :apiKey="builderContext.apiKey"
      :context="builderContext.context"
      :data="{ ...(symbol && symbol.data),
  ...builderContext.state,
  ...(((symbol && symbol.content) && (symbol && symbol.content).data) && ((symbol && symbol.content) && (symbol && symbol.content).data).state)
}"
      :model="(symbol && symbol.model)"
      :content="content"
    ></render-content>
  </div>
</template>
<script>
import RenderContent from "../../components/render-content/render-content";
import BuilderContext from "../../context/builder.context";
import { getContent } from "../../functions/get-content";

export default {
  name: "builder-symbol",
  components: { "render-content": async () => RenderContent },
  props: ["symbol", "attributes"],

  data: () => ({ className: "builder-symbol", content: null }),

  inject: {
    builderContext: "BuilderContext",
  },

  mounted() {
    this.content = this.symbol?.content;
  },

  watch: {
    onUpdateHook0() {
      const symbolToUse = this.symbol;

      if (
        symbolToUse &&
        !symbolToUse.content &&
        !this.content &&
        symbolToUse.model
      ) {
        getContent({
          model: symbolToUse.model,
          apiKey: this.builderContext.apiKey,
          options: {
            entry: symbolToUse.entry,
          },
        }).then((response) => {
          this.content = response;
        });
      }
    },
  },

  computed: {
    onUpdateHook0() {
      return {
        0: this.symbol?.content,
        1: this.symbol?.model,
        2: this.symbol?.entry,
        3: this.content,
      };
    },
  },

  methods: {
    _classStringToObject(str) {
      const obj = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
};
</script>
