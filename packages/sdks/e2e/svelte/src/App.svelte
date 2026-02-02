<script lang="ts">
  import { Content, _processContentResult } from '@builder.io/sdk-svelte';
  import { getProps } from '@sdk/tests';
  import BuilderBlockWithClassName from './BuilderBlockWithClassName.svelte';

  const builderBlockWithClassNameCustomComponent = {
    name: 'BuilderBlockWithClassName',
    component: BuilderBlockWithClassName,
    shouldReceiveBuilderProps: {
      builderBlock: true,
    },
    inputs: [
      {
        name: 'content',
        type: 'uiBlocks',
        defaultValue: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-c6e179528dee4e62b337cf3f85d6496f',
            component: {
              name: 'Text',
              options: {
                text: 'Enter some text...',
              },
            },
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '20px',
                lineHeight: 'normal',
                height: 'auto',
              },
            },
          },
        ],
      },
    ],
  };

  let props = $state(undefined);
  const fetch = async () => {
    props = await getProps({ _processContentResult });
    props.customComponents = [builderBlockWithClassNameCustomComponent];
  };

  fetch();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  {#if props}
    <Content {...props} />
  {:else}
    Content Not Found
  {/if}
</main>
