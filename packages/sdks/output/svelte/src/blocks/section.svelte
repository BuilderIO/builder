<script>
    
    
    
    
  
  


    
    export let attributes;
export let maxWidth;
export let children;

    
    

    

    

    

    
  </script>

  <section {...attributes} style={maxWidth && typeof maxWidth === 'number' ? {
maxWidth: maxWidth
} : undefined} >
    
<slot></slot>

  </section>