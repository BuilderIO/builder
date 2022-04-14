<script>
  import { getBlockComponentOptions } from "../functions/get-block-component-options";
  import { getBlockProperties } from "../functions/get-block-properties";
  import { getBlockStyles } from "../functions/get-block-styles";
  import { getBlockTag } from "../functions/get-block-tag";
  import { components } from "../functions/register-component";
  import BuilderContext from "../context/builder.context.lite";
  import { getBlockActions } from "../functions/get-block-actions";
  import { getProcessedBlock } from "../functions/get-processed-block";
  import BlockStyles from "./block-styles.lite";

  export let block;

  $: component = () => {
    const componentName = useBlock.component?.name;

    if (!componentName) {
      return null;
    }

    const ref = components[useBlock.component?.name!];

    if (componentName && !ref) {
      // TODO: Public doc page with more info about this message
      console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
    }

    return ref;
  };
  $: componentInfo = () => {
    return component?.info;
  };
  $: componentRef = () => {
    return component?.component;
  };
  $: tagName = () => {
    return getBlockTag(useBlock);
  };
  $: useBlock = () => {
    return getProcessedBlock({
      block: block,
      state: builderContext.state,
      context: builderContext.context,
    });
  };
  $: propertiesAndActions = () => {
    return {
      ...getBlockProperties(useBlock),
      ...getBlockActions({
        block: useBlock,
        state: builderContext.state,
        context: builderContext.context,
      }),
    };
  };
  $: css = () => {
    return getBlockStyles(useBlock);
  };
  $: componentOptions = () => {
    return getBlockComponentOptions(useBlock);
  };
  $: children = () => {
    // TO-DO: When should `canHaveChildren` dictate rendering?
    // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
    // but still receive and need to render children.
    // return componentInfo?.canHaveChildren ? useBlock.children : [];
    return useBlock.children ?? [];
  };
  $: noCompRefChildren = () => {
    return componentRef ? [] : children;
  };

</script>

{#if !componentInfo?.noWrap}
  <state.tagName {...propertiesAndActions} style={css}>
    <BlockStyles block={useBlock} />

    {#if componentRef}
      <state.componentRef {...componentOptions} builderBlock={useBlock}>
        {#each children as child}
          <RenderBlock block={child} />
        {/each}
      </state.componentRef>
    {/if}

    {#each noCompRefChildren as child}
      <RenderBlock block={child} />
    {/each}
  </state.tagName>
{/if}
