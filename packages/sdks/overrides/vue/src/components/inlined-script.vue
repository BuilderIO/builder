<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  render() {
    return h('script', {
      id: this.id,
      innerHTML: this.scriptStr,
      'data-id': this.dataId,
    });
  },
  name: 'inlined-script',

  props: ['scriptStr', 'id', 'dataId'],
});
</script>
