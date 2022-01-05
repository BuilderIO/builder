<template>
  <div class="builder-symbol">
    <render-content
      :context="builderContext.context"
      :data="symbol && symbol.data"
      :model="symbol && symbol.model"
      :content="symbol && symbol.content"
    ></render-content>
  </div>
</template>
<script>
import RenderContent from '../components/render-content';
import BuilderContext from '../context/builder.context';

export default {
  name: 'builder-symbol',
  components: { 'render-content': async () => RenderContent },
  props: ['symbol'],

  inject: {
    builderContext: 'BuilderContext',
  },
};
</script>
