<script>
    
    
    
    
  
  


    
    export let altText;
export let backgroundSize;
export let class;
export let image;
export let srcset;
export let sizes;
export let aspectRatio;
export let fitContent;
export let builderBlock;
export let children;

    
    

    

    

    

    
  </script>

  <div  class="div" >
    
<picture >
      
<img  loading="lazy"  class="img"  alt={altText}  aria-role={altText ? 'presentation' : undefined}  style={{
objectPosition: backgroundSize || 'center',
objectFit: backgroundSize || 'cover'
}}  class={'builder-image' + (class ? ' ' + class : '')}  src={image}  srcset={srcset}  sizes={sizes}  />

      
<source  srcSet={srcset}  />

    </picture>

    
{#if aspectRatio && !(fitContent && builderBlock?.children?.length) }<div  class="builder-image-sizer div-2"  style={{
paddingTop: aspectRatio * 100 + '%'
}} >
          
{' '}

        </div>{/if}

    
{#if builderBlock?.children?.length && fitContent }
      
<slot></slot>

    {/if}


    
{#if !fitContent }
      
<div  class="div-3" >
        
<slot></slot>

      </div>

    {/if}

  </div>

  <style>
    .div { 
position: relative; }.img { 
opacity: 1;
transition: opacity 0.2s ease-in-out;
position: absolute;
height: 100%;
width: 100%;
top: 0px;
left: 0px; }.div-2 { 
width: 100%;
pointer-events: none;
font-size: 0; }.div-3 { 
display: flex;
flex-direction: column;
align-items: stretch;
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%; }
  </style>