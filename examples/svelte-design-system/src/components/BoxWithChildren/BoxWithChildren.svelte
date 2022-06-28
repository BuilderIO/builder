<script lang="ts">
  export let textBefore = ''
  export let textAfter = ''
  export let children : any[]
  import * as BuilderSDK from '@builder.io/sdk-svelte';
  /*
  ! Important
  Simple component to show how to render children components
  for Svelte with Builder.io

  // Can have children to true (from the input props)
  // allows children
*/
</script>

<div class="container">
  <p>{textBefore}</p>
  <slot></slot>
  <BuilderSDK.RenderBlocks
    child
    blocks={children}
  />
  <p>{textAfter}</p>
</div>

<style>
  .container {
    border: 1px solid #333;
    border-radius: 5px;
    padding: 16px;
    position: relative;
  }
</style>