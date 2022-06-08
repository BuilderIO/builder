<script>
    
    
    
    
  import  {  TARGET  }  from '../../constants/target.js';
import  BuilderContext,  {  }  from '../../context/builder.context';
import  {  getBlockActions  }  from '../../functions/get-block-actions.js';
import  {  getBlockComponentOptions  }  from '../../functions/get-block-component-options.js';
import  {  getBlockProperties  }  from '../../functions/get-block-properties.js';
import  {  getBlockStyles  }  from '../../functions/get-block-styles.js';
import  {  getBlockTag  }  from '../../functions/get-block-tag.js';
import  {  getProcessedBlock  }  from '../../functions/get-processed-block.js';
import  BlockStyles,  {  }  from './block-styles.svelte';
import  {  isEmptyHtmlElement  }  from './render-block.helpers.js';

  

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

$: propertiesAndActions = () => {
return { ...getBlockProperties(useBlock()),
  ...getBlockActions({
    block: useBlock(),
    state: builderContext.state,
    context: builderContext.context
  })
};
};

$: css = () => {
return getBlockStyles(useBlock());
};

$: componentOptions = () => {
return getBlockComponentOptions(useBlock());
};

$: children = () => {
// TO-DO: When should `canHaveChildren` dictate rendering?
// This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
// but still receive and need to render children.
// return componentInfo?.()?.canHaveChildren ? useBlock().children : [];
return useBlock().children ?? [];
};

$: noCompRefChildren = () => {
return componentRef() ? [] : children();
};

    let builderContext = getContext(BuilderContext.key);
    
    

    

    

    
  </script>

  
{#if !componentInfo?.()?.noWrap }

    

{#if !isEmptyHtmlElement(tagName()) }

      
<svelte:element {...propertiesAndActions()} style={css()}  this={tagName()} >
        

{#if TARGET === 'vue' || TARGET === 'svelte' }

          
<BlockStyles  block={useBlock()} ></BlockStyles>

        


{/if}

        

{#if componentRef() }
<svelte:component {...componentOptions()} builderBlock={useBlock()}  this={componentRef()} >
            

{#each children() as child, index }
<svelte:self  key={child.id}  block={child} ></svelte:self>
{/each}


          </svelte:component>


{/if}

        

{#each noCompRefChildren() as child, index }
<svelte:self  key={child.id}  block={child} ></svelte:self>
{/each}


      </svelte:element>

    


{:else}
<svelte:element {...propertiesAndActions()} style={css()}  this={tagName()} ></svelte:element>

{/if}

  


{:else}
<svelte:component {...componentOptions()} attributes={propertiesAndActions()}  builderBlock={useBlock()}  style={css()}  this={componentRef()} >
        

{#each children() as child, index }
<svelte:self  key={child.id}  block={child} ></svelte:self>
{/each}


      </svelte:component>

{/if}