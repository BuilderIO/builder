<script>
  export let attributes;
  export let text;

</script>

<span
  class={attributes?.class || attributes?.className}
  innerHTML={text || ''} />
