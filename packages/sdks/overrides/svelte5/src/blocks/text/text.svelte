<script lang="ts">
  import type { TextProps } from './text.types.js';

  let { text }: TextProps = $props();
</script>

<!-- NOTE: the class must be "builder-text" for inline editing in the Builder editor -->
<div class="builder-text" style="outline:none;">{@html text?.toString() || ''}</div>
