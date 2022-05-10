<script>
    
    
    
    
  import  {  TARGET  }  from '../constants/target.js';

  

    

    
    export let styles;
    
    
    $: injectedStyleScript = () => {
return `<${tagName()}>${styles}</${tagName()}>`;
};

$: tagName = () => {
// NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
// https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
return 'sty' + 'le';
};

    
    
    

    

    

    
  </script>

  
{#if TARGET === 'svelte' }

    
{@html injectedStyleScript()}

  


{:else}
<svelte:component  this={tagName()} >{styles}</svelte:component>

{/if}