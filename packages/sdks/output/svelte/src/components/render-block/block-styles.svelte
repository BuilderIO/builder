<script>
    
    
    
    
  import  {  TARGET  }  from '../../constants/target.js';
import  BuilderContext,  {  }  from '../../context/builder.context';
import  {  getProcessedBlock  }  from '../../functions/get-processed-block.js';
import  RenderInlinedStyles,  {  }  from '../render-inlined-styles.svelte';

  

    import { getContext, setContext } from "svelte";

    
    export let block;
    
    function camelToKebabCase(string) {
return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
    $: useBlock = () => {
return getProcessedBlock({
  block: block,
  state: builderContext.state,
  context: builderContext.context
});
};

$: css = () => {
// TODO: media queries
const styleObject = useBlock().responsiveStyles?.large;

if (!styleObject) {
  return '';
}

let str = `.${useBlock().id} {`;

for (const key in styleObject) {
  const value = styleObject[key];

  if (typeof value === 'string') {
    str += `${camelToKebabCase(key)}: ${value};`;
  }
}

str += '}';
return str;
};

    let builderContext = getContext(BuilderContext.key);
    
    

    

    

    
  </script>

  
{#if TARGET === 'vue' || TARGET === 'svelte' }

    
<RenderInlinedStyles  styles={css()} ></RenderInlinedStyles>

  


{/if}