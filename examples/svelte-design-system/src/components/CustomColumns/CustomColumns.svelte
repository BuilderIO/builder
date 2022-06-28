<script lang="ts">
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import Card from '@smui/card';
  import * as BuilderSDK from '@builder.io/sdk-svelte';

  export let columns : any[]
  export let builderBlock: { id: string };
  export let columnsSize = '3'

  $: max_columns = Number(columnsSize)
  
  $: rows = Math.ceil(columns.length / max_columns)
  $: lastColumns = (columns.length % max_columns) === 0 ? max_columns : (columns.length % max_columns)
  $: span = Math.ceil(12 / max_columns )

</script>

<div style="width: 100%">
  <LayoutGrid>
    {#each Array(rows) as _unused, i}
      {#each Array(i === rows - 1 ? lastColumns : max_columns ) as _unused, j}
        <Cell span={span} key={i + j}>
          <Card>
            <div class="container">
              {#if columns[i + j].image}
                <img src={columns[i + j].image} alt="" />
              {/if}
              <BuilderSDK.RenderBlocks
                key={i + j}
                child
                parentElementId={builderBlock && builderBlock.id}
                blocks={columns[i + j].blocks}
                dataPath={`component.options.columns.${i + j}.blocks`}
              />
            </div>
          </Card>
        </Cell>
      {/each}
    {/each}
  </LayoutGrid>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
  }

  img {
    height: 300px;
    object-fit: cover;
  }
</style>