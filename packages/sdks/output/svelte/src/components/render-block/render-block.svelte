<script>
    
    
    
    
  import  BuilderContext,  {  }  from '../../context/builder.context';
import  {  getBlockActions  }  from '../../functions/get-block-actions.js';
import  {  getBlockComponentOptions  }  from '../../functions/get-block-component-options.js';
import  {  getBlockProperties  }  from '../../functions/get-block-properties.js';
import  {  getBlockStyles  }  from '../../functions/get-block-styles.js';
import  {  getBlockTag  }  from '../../functions/get-block-tag.js';
import  {  getProcessedBlock  }  from '../../functions/get-processed-block.js';
import  {  isEmptyHtmlElement  }  from './render-block.helpers.js';
import  RenderComponentAndStyles,  {  }  from './render-component-and-styles.svelte';

  

    import { getContext, setContext } from "svelte";

    
    export let block;
    
    
    $: component = () => {
const componentName = useBlock().component?.name;

if (!componentName) {
  return null;
}

const ref = builderContext.registeredComponents[componentName];

if (!ref) {
  // TODO: Public doc page with more info about this message
  console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
  return undefined;
} else {
  return ref;
}
};

$: componentInfo = () => {
if (component()) {
  const {
    component: _,
    ...info
  } = component();
  return info;
} else {
  return undefined;
}
};

$: componentRef = () => {
return component?.()?.component;
};

$: tagName = () => {
return getBlockTag(useBlock());
};

$: useBlock = () => {
return getProcessedBlock({
  block: block,
  state: builderContext.state,
  context: builderContext.context
});
};

$: attributes = () => {
return { ...getBlockProperties(useBlock()),
  ...getBlockActions({
    block: useBlock(),
    state: builderContext.state,
    context: builderContext.context
  }),
  style: getBlockStyles(useBlock())
};
};

$: shouldWrap = () => {
return !componentInfo?.()?.noWrap;
};

$: componentOptions = () => {
return { ...getBlockComponentOptions(useBlock()),

  /**
   * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
   * they are provided to the component itself directly.
   */
  ...(shouldWrap() ? {} : {
    attributes: attributes()
  })
};
};

$: children = () => {
// TO-DO: When should `canHaveChildren` dictate rendering?
// This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
// but still receive and need to render children.
// return componentInfo?.()?.canHaveChildren ? useBlock().children : [];
return useBlock().children ?? [];
};

$: noCompRefChildren = () => {
/**
 * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
 * we render them outside of `componentRef`
 */
return componentRef() ? [] : children();
};

    let builderContext = getContext(BuilderContext.key);
    
    

    

    

    
  </script>

  
{#if shouldWrap() }

    

{#if !isEmptyHtmlElement(tagName()) }

      
<svelte:element {...attributes()} this={tagName()} >
        
<RenderComponentAndStyles  block={useBlock()}  blockChildren={children()}  componentRef={componentRef()}  componentOptions={componentOptions()} ></RenderComponentAndStyles>

        

{#each noCompRefChildren() as child, index }
<svelte:self  key={child.id}  block={child} ></svelte:self>
{/each}


      </svelte:element>

    


{:else}
<svelte:element {...attributes()} this={tagName()} ></svelte:element>

{/if}

  


{:else}
<RenderComponentAndStyles  block={useBlock()}  blockChildren={children()}  componentRef={componentRef()}  componentOptions={componentOptions()} ></RenderComponentAndStyles>

{/if}