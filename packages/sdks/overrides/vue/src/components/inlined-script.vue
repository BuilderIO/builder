<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  render() {
    return h('script', {
      innerHTML: this.scriptStr,
      'data-id': this.id,
    });
  },
  name: 'inlined-script',

  props: ['scriptStr', 'id'],
});
</script>
