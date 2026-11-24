<script lang="ts">
  import Blocks from '../../components/blocks/blocks.svelte';
  import { styleString } from '../../helpers/style-string.js';
  import type { AccordionProps } from './accordion.types.js';
  import { convertOrderNumberToString } from './helpers.js';

  let {
    items,
    oneAtATime,
    grid,
    gridRowWidth,
    builderBlock,
    builderContext,
    builderComponents,
    builderLinkComponent,
  }: AccordionProps = $props();

  let open = $state<number[]>([]);

  const onlyOneAtATime = $derived(Boolean(grid || oneAtATime));

  const accordionStyles = $derived(
    styleString({
      display: 'flex',
      alignItems: 'stretch',
      flexDirection: 'column',
      ...(grid && {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }),
    })
  );

  const accordionTitleStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    cursor: 'pointer',
  };

  const getAccordionTitleClassName = (index: number) =>
    `builder-accordion-title builder-accordion-title-${open.includes(index) ? 'open' : 'closed'}`;

  const getAccordionDetailClassName = (index: number) =>
    `builder-accordion-detail builder-accordion-detail-${open.includes(index) ? 'open' : 'closed'}`;

  // In a grid, the open item's detail goes after the last item of its row.
  const openGridItemOrder = $derived.by((): number | null => {
    let itemOrder: number | null = null;
    const getOpenGridItemPosition = grid && open.length;
    if (getOpenGridItemPosition && document) {
      const openItemIndex = open[0];
      const openItem = document.querySelector(
        `.builder-accordion-title[data-index="${openItemIndex}"]`
      );

      let subjectItem = openItem;
      itemOrder = openItemIndex;

      if (subjectItem) {
        let prevItemRect = subjectItem.getBoundingClientRect();

        while ((subjectItem = subjectItem && subjectItem.nextElementSibling)) {
          if (subjectItem) {
            if (subjectItem.classList.contains('builder-accordion-detail')) {
              continue;
            }
            const subjectItemRect = subjectItem.getBoundingClientRect();
            if (subjectItemRect.left > prevItemRect.left) {
              const index = parseInt(subjectItem.getAttribute('data-index') || '', 10);
              if (!isNaN(index)) {
                prevItemRect = subjectItemRect;
                itemOrder = index;
              }
            } else {
              break;
            }
          }
        }
      }
    }

    if (typeof itemOrder === 'number') {
      itemOrder = itemOrder + 1;
    }

    return itemOrder;
  });

  const accordionDetailStyles = $derived(
    styleString({
      order: typeof openGridItemOrder === 'number' ? openGridItemOrder : undefined,
      ...(grid && { width: '100%' }),
    })
  );

  const getTitleStyle = (index: number) =>
    styleString({
      ...accordionTitleStyles,
      ...(grid && {
        width: gridRowWidth,
        order:
          openGridItemOrder !== null
            ? convertOrderNumberToString(index)
            : convertOrderNumberToString(index + 1),
      }),
    });

  function onClick(index: number) {
    if (open.includes(index)) {
      open = onlyOneAtATime ? [] : open.filter((item) => item !== index);
    } else {
      open = onlyOneAtATime ? [index] : open.concat(index);
    }
  }
</script>

<div class="builder-accordion" style={accordionStyles}>
  {#each items as item, index (index)}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div
      class={getAccordionTitleClassName(index)}
      style={getTitleStyle(index)}
      data-index={index}
      onclick={() => onClick(index)}
    >
      <Blocks
        blocks={item.title}
        path={`items.${index}.title`}
        parent={builderBlock.id}
        context={builderContext}
        registeredComponents={builderComponents}
        linkComponent={builderLinkComponent}
      />
    </div>
    {#if open.includes(index)}
      <div class={getAccordionDetailClassName(index)} style={accordionDetailStyles}>
        <Blocks
          blocks={item.detail}
          path={`items.${index}.detail`}
          parent={builderBlock.id}
          context={builderContext}
          registeredComponents={builderComponents}
          linkComponent={builderLinkComponent}
        />
      </div>
    {/if}
  {/each}
</div>
