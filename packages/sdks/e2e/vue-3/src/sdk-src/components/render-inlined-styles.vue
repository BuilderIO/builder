<script lang="ts">
import { h, defineComponent } from 'vue';

export default defineComponent({
  render() {
    return h('style', { id: this.id, innerHTML: this.styles });
  },
  name: 'render-inlined-styles',

  props: ['styles', 'id'],
});
</script>
