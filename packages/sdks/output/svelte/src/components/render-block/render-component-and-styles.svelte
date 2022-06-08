<script>
  
  
  
  
import  {  TARGET  }  from '../../constants/target.js';
import  BlockStyles,  {  }  from './block-styles.svelte';
import  RenderBlock,  {  }  from './render-block.svelte';



  

  
  export let block;
export let componentRef;
export let componentOptions;
export let blockChildren;
  
  
  

  
  
  

  

  

  
</script>


  

{#if TARGET === 'vue' || TARGET === 'svelte' }

    
<BlockStyles  block={block} ></BlockStyles>

  


{/if}

  

{#if componentRef }
<svelte:component {...componentOptions} this={componentRef} >
      

{#each blockChildren as child, index }
<RenderBlock  key={child.id}  block={child} ></RenderBlock>
{/each}


    </svelte:component>


{/if}