<script>
  
  
  
  



  

  
  export let attributes;
export let text;
export let link;
export let openLinkInNewTab;
  
  
  

  
  
  

  

  

  
</script>


  

{#if link }

    
<a {...attributes} role="button"  href={link}  target={openLinkInNewTab ? '_blank' : undefined} >
      
{text}

    </a>

  
{/if}