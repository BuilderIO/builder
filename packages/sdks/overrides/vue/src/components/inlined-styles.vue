<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  render() {
    return h('style', {
      id: this.id,
      innerHTML: this.styles,
      'data-id': this.dataId,
    });
  },
  name: 'inlined-styles',

  props: ['styles', 'id', 'dataId'],
});
</script>
