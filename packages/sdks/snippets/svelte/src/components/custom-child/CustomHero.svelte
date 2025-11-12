<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<section>
  <div>This is text from your component</div>
  <!-- The slot will render any child blocks from Builder -->
  {@render children?.()}
</section>
