<script>
    import { onMount } from 'svelte'
    import { afterUpdate } from 'svelte'
    
    
  import  RenderContent,  {  }  from '../components/render-content/render-content.svelte';
import  BuilderContext,  {  }  from '../context/builder.context';
import  {  getContent  }  from '../functions/get-content';

  

    import { getContext, setContext } from "svelte";

    
    export let attributes;
export let symbol;
    
    
    

    let builderContext = getContext(BuilderContext.key);
    
    let className = 'builder-symbol';
let content = null;

    onMount(() => { content = symbol?.content; });

    afterUpdate(() => { const symbolToUse = symbol;

if (symbolToUse && !symbolToUse.content && !content && symbolToUse.model) {
getContent({
  model: symbolToUse.model,
  apiKey: builderContext.apiKey,
  options: {
    entry: symbolToUse.entry
  }
}).then(response => {
  content = response;
});
} })

    
  </script>

  <div {...attributes} dataSet={{
class: className
}}  class={className} >
    
<RenderContent  apiKey={builderContext.apiKey}  context={builderContext.context}  data={{ ...symbol?.data,
...builderContext.state,
...symbol?.content?.data?.state
}}  model={symbol?.model}  content={content} ></RenderContent>

  </div>