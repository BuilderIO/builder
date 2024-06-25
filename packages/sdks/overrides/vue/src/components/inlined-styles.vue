<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  render() {
    return h('style', {
      innerHTML: this.styles,
      'data-id': this.id,
    });
  },
  name: 'inlined-styles',

  props: ['styles', 'id'],
});
</script>
