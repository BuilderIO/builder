<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  render() {
    return h('script', { id: this.id, innerHTML: this.scriptStr });
  },
  name: 'render-inlined-styles',

  props: ['scriptStr', 'id'],
});
</script>
