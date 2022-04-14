<script>
    
    
    
    
  import  {  isEditing  }  from '../functions/is-editing';

  


    
    export let backgroundSize;
export let backgroundPosition;
export let attributes;
export let imgSrc;
export let altText;

    
    

    

    

    

    
  </script>

  <img {...attributes} style={{
objectFit: backgroundSize || 'cover',
objectPosition: backgroundPosition || 'center'
}}  key={isEditing() && imgSrc || 'default-key'}  alt={altText}  src={imgSrc}  />