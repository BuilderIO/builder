<script>
  export let context = {};
</script>

<div>hello {context?.builderContent?.data?.title || 'World'}</div>
