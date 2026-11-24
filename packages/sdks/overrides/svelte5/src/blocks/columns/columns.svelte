<script lang="ts">
  import Blocks from '../../components/blocks/blocks.svelte';
  import type { SizeName } from '../../constants/device-sizes.js';
  import { getSizesForBreakpoints } from '../../constants/device-sizes.js';
  import { TARGET } from '../../constants/target.js';
  import { getClassPropName } from '../../functions/get-class-prop-name.js';
  import { mapStyleObjToStrIfNeeded } from '../../functions/get-style.js';
  import { styleTag } from '../../helpers/inline-tags.js';
  import { styleString } from '../../helpers/style-string.js';
  import type { Dictionary } from '../../types/typescript.js';
  import type { Column, ColumnProps } from './columns.types.js';
  import { getColumnsClass } from './helpers.js';

  type CSSVal = string | number;

  let {
    columns,
    space,
    stackColumnsAt,
    reverseColumnsWhenStacked,
    builderBlock,
    builderContext,
    builderComponents,
    builderLinkComponent,
  }: ColumnProps = $props();

  const gutterSize = $derived(typeof space === 'number' ? space || 0 : 20);
  const cols = $derived(columns || []);
  const stackAt = $derived(stackColumnsAt || 'tablet');
  const flexDir = $derived<'row' | 'column' | 'column-reverse'>(
    stackColumnsAt === 'never'
      ? 'row'
      : reverseColumnsWhenStacked
        ? 'column-reverse'
        : 'column'
  );

  function getTagName(column: Column) {
    return column.link ? builderLinkComponent || 'a' : 'div';
  }

  function getWidth(index: number) {
    return cols[index]?.width || 100 / cols.length;
  }

  function getColumnCssWidth(index: number) {
    const width = getWidth(index);
    const subtractWidth = gutterSize * (cols.length - 1) * (width / 100);
    return `calc(${width}% - ${subtractWidth}px)`;
  }

  function getTabletStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }): CSSVal {
    return stackAt === 'tablet' ? stackedStyle : desktopStyle;
  }

  function getMobileStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }): CSSVal {
    return stackAt === 'never' ? desktopStyle : stackedStyle;
  }

  const columnsCssVars = $derived({
    '--flex-dir': flexDir,
    '--flex-dir-tablet': getTabletStyle({ stackedStyle: flexDir, desktopStyle: 'row' }),
  } as Dictionary<string>);

  function columnCssVars(index: number): Dictionary<string> {
    const gutter = index === 0 ? 0 : gutterSize;
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = '100%';
    const mobileMarginLeft = 0;

    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      width,
      'margin-left': gutterPixels,
      '--column-width-mobile': getMobileStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      '--column-margin-left-mobile': getMobileStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
      '--column-width-tablet': getTabletStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      '--column-margin-left-tablet': getTabletStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
    } as Dictionary<string>;
  }

  function getWidthForBreakpointSize(size: SizeName) {
    const breakpointSizes = getSizesForBreakpoints(
      builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  }

  // A style tag rather than `style`/`css`: the media queries depend on the content's custom breakpoints.
  const columnsStyles = $derived.by(() => {
    const childColumnDiv = `.${builderBlock.id}-breakpoints > .builder-column`;
    return `
        @media (max-width: ${getWidthForBreakpointSize('medium')}px) {
          .${builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          ${childColumnDiv} {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize('small')}px) {
          .${builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          ${childColumnDiv} {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
  });

  function getAttributes(column: Column, index: number): Record<string, any> {
    return {
      ...(column.link ? { href: column.link } : {}),
      [getClassPropName()!]: 'builder-column',
      style: mapStyleObjToStrIfNeeded(columnCssVars(index) as Partial<CSSStyleDeclaration>),
    };
  }
</script>

<div class="{getColumnsClass(builderBlock?.id)} div" style={styleString(columnsCssVars)}>
  {#if TARGET !== 'reactNative'}
    {@html styleTag('builderio-columns', columnsStyles, builderContext.nonce)}
  {/if}

  {#each columns || [] as column, index (index)}
    {@const TagName = getTagName(column)}
    {#snippet columnBlocks()}
      <Blocks
        blocks={column.blocks}
        path={`columns.${index}.blocks`}
        parent={builderBlock.id}
        styleProp={{ flexGrow: '1' }}
        context={builderContext}
        registeredComponents={builderComponents}
        linkComponent={builderLinkComponent}
      />
    {/snippet}
    {#if typeof TagName === 'string'}
      <svelte:element this={TagName} {...getAttributes(column, index)}
        >{@render columnBlocks()}</svelte:element
      >
    {:else}
      <TagName {...getAttributes(column, index)}>{@render columnBlocks()}</TagName>
    {/if}
  {/each}
</div>

<style>
  .div {
    display: flex;
    line-height: normal;
    height: 100%;
  }
</style>
