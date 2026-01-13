<script lang="ts">
  import { Content, setClientUserAttributes } from '@builder.io/sdk-svelte';
  import BuilderBlockWithClassName from '../../components/BuilderBlockWithClassName.svelte';
  import Hello from '../../components/Hello.svelte';

  if (typeof window !== 'undefined') {
    if (window.location.pathname === '/variant-containers') {
      setClientUserAttributes({
        device: 'tablet',
      });
    }
  }

  // this data comes from the function in `+page.server.ts`, which runs on the server only
  export let data;
  
  const helloCustomComponent = {
    name: 'Hello',
    component: Hello,
    inputs: [],
  };

  const builderBlockWithClassNameCustomComponent = {
    name: 'BuilderBlockWithClassName',
    component: BuilderBlockWithClassName,
    shouldReceiveBuilderProps: {
      builderBlock: true,
      builderContext: true,
      builderComponents: true,
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
</script>

<main>
  {#if data.props}
    {#key data.props}
      <Content
        {...data.props}
        customComponents={[
          ...data.customComponents,
          helloCustomComponent,
          builderBlockWithClassNameCustomComponent,
        ]}
      />
    {/key}
  {:else}
    Content Not Found
  {/if}
</main>
