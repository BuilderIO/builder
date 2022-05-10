<script>
    
    
    
    
  import  {  isEditing  }  from '../functions/is-editing.js';
import  RenderBlock,  {  }  from './render-block/render-block.svelte';

  

    

    
    export let blocks;
export let parent;
export let path;
    
    function onClick() {
if (isEditing() && !blocks?.length) {
  window.parent?.postMessage({
    type: 'builder.clickEmptyBlocks',
    data: {
      parentElementId: parent,
      dataPath: path
    }
  }, '*');
}
}

function onMouseEnter() {
if (isEditing() && !blocks?.length) {
  window.parent?.postMessage({
    type: 'builder.hoverEmptyBlocks',
    data: {
      parentElementId: parent,
      dataPath: path
    }
  }, '*');
}
}
    $: className = () => {
return 'builder-blocks' + (!blocks?.length ? ' no-blocks' : '');
};

    
    
    

    

    

    
  </script>

  <div    builder-path={path}  builder-parent-id={parent}  dataSet={{
class: className()
}}  on:click="{event => onClick()}"  on:mouseenter="{event => onMouseEnter()}"  class={className()} >
    

{#if blocks }

      

{#each blocks as block, index }
<RenderBlock  key={block.id}  block={block} ></RenderBlock>
{/each}


    


{/if}

  </div>

  <style>
    .div { 
display: flex;
flex-direction: column;
align-items: stretch; }
  </style>