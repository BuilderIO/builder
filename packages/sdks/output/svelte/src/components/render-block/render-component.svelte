<script>
  
  
  
  
import  BlockStyles,  {  }  from './block-styles.svelte';
import  RenderBlock,  {  }  from './render-block.svelte';



  

  
  export let componentRef;
export let componentOptions;
export let blockChildren;
  
  
  

  
  
  

  

  

  
</script>


{#if componentRef }

  
<svelte:component {...componentOptions} this={componentRef} >
    

    

{#each blockChildren as child, index }
<RenderBlock  key={'render-block-' + child.id}  block={child} ></RenderBlock>
{/each}


    

{#each blockChildren as child, index }
<BlockStyles  key={'block-style-' + child.id}  block={child} ></BlockStyles>
{/each}


  </svelte:component>




{/if}