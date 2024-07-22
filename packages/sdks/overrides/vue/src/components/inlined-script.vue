<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  render() {
    return h('script', {
      innerHTML: this.scriptStr,
      'data-id': this.id,
      nonce: this.nonce,
    });
  },
  name: 'inlined-script',

  props: ['scriptStr', 'id', 'nonce'],
});
</script>
