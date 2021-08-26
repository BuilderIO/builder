<template>
  <div class="builder-symbol">
    <render-content
      :context="builderContext.context"
      :data="symbol?.data"
      :model="symbol?.model"
      :content="symbol?.content"
    ></render-content>
  </div>
</template>
<script>
import RenderContent from "../components/render-content.lite";
import BuilderContext from "../context/builder.context.lite";

export default {
  name: "Symbol",
  components: { RenderContent },
  props: ["symbol"],

  data: () => ({ RenderContent }),

  inject: {
    builderContext: "BuilderContext",
  },
};
</script>
