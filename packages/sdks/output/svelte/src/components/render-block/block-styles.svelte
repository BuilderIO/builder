<script>
    
    
    
    
  import  RenderInlinedStyles,  {  }  from '../render-inlined-styles.svelte';

  

    

    
    export let block;
    
    function camelToKebabCase(string) {
return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
    $: css = () => {
// TODO: media queries
const styleObject = block.responsiveStyles?.large;

if (!styleObject) {
  return '';
}

let str = `.${block.id} {`;

for (const key in styleObject) {
  const value = styleObject[key];

  if (typeof value === 'string') {
    str += `${camelToKebabCase(key)}: ${value};`;
  }
}

str += '}';
return str;
};

    
    
    

    

    

    
  </script>

  <RenderInlinedStyles  styles={css()} ></RenderInlinedStyles>