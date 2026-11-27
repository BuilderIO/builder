import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from '../../../constants/device-sizes.js';
import { camelToKebabCase } from '../../../functions/camel-to-kebab-case.js';
import {
  getProcessedBlock,
  hasBindings,
} from '../../../functions/get-processed-block.js';
import {
  createCssClass,
  getResponsiveStylesWithImagePosition,
} from '../../../helpers/css.js';
import { checkIsDefined } from '../../../helpers/nullable.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import type { BuilderContent } from '../../../types/builder-content.js';

/**
 * Only render styles for blocks that are visible.
 */
export const canShowBlockStyles = (block: BuilderBlock): boolean => {
  if (checkIsDefined(block.hide)) {
    return !block.hide;
  }
  if (checkIsDefined(block.show)) {
    return Boolean(block.show);
  }
  return true;
};

/**
 * The responsive (and hover animation) CSS of one block, scoped to its id class.
 */
export const getBlockStylesCss = (
  block: BuilderBlock,
  content: BuilderContent | null | undefined
): string => {
  const className = block.id;

  if (!className) {
    return '';
  }

  const styles = getResponsiveStylesWithImagePosition(
    block.responsiveStyles,
    block.component?.name === 'Image'
  );

  const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
    content?.meta?.breakpoints || {}
  );

  const contentHasXSmallBreakpoint = Boolean(
    content?.meta?.breakpoints?.xsmall
  );

  const largeStyles = styles?.large;
  const mediumStyles = styles?.medium;
  const smallStyles = styles?.small;
  const xsmallStyles = styles?.xsmall;

  const largeStylesClass = largeStyles
    ? createCssClass({ className, styles: largeStyles })
    : '';

  const mediumStylesClass = mediumStyles
    ? createCssClass({
        className,
        styles: mediumStyles,
        mediaQuery: getMaxWidthQueryForSize(
          'medium',
          sizesWithUpdatedBreakpoints
        ),
      })
    : '';

  const smallStylesClass = smallStyles
    ? createCssClass({
        className,
        styles: smallStyles,
        mediaQuery: getMaxWidthQueryForSize(
          'small',
          sizesWithUpdatedBreakpoints
        ),
      })
    : '';

  const xsmallStylesClass =
    xsmallStyles && contentHasXSmallBreakpoint
      ? createCssClass({
          className,
          styles: xsmallStyles,
          mediaQuery: getMaxWidthQueryForSize(
            'xsmall',
            sizesWithUpdatedBreakpoints
          ),
        })
      : '';

  const hoverAnimation =
    block.animations &&
    block.animations.find((item) => item.trigger === 'hover');

  let hoverStylesClass = '';
  if (hoverAnimation) {
    const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
    hoverStylesClass =
      createCssClass({
        className: `${className}:hover`,
        styles: {
          ...hoverStyles,
          transition: `all ${hoverAnimation.duration}s ${camelToKebabCase(
            hoverAnimation.easing
          )}`,
          transitionDelay: hoverAnimation.delay
            ? `${hoverAnimation.delay}s`
            : '0s',
        },
      }) || '';
  }

  return [
    largeStylesClass,
    mediumStylesClass,
    smallStylesClass,
    xsmallStylesClass,
    hoverStylesClass,
  ].join(' ');
};

const BUILDER_ELEMENT_TYPE = '@builder.io/sdk:Element';

type ContentBlockStyles = {
  /** The CSS of every block in `ids`, for one stylesheet per Content. */
  css: string;
  /** Blocks whose CSS is in `css`, so they do not render their own `<style>` tag. */
  ids: Set<string>;
};

const EMPTY_CONTENT_BLOCK_STYLES: ContentBlockStyles = {
  css: '',
  ids: new Set(),
};

const CONTENT_BLOCK_STYLES = new WeakMap<
  BuilderContent,
  { locale: string; value: ContentBlockStyles }
>();

/**
 * Collects the styles of the content's blocks into one stylesheet, instead of a `<style>` tag
 * per block. Only blocks whose CSS cannot change with state are collected: no bindings, no
 * repeat, and an id no other block in the content shares with different CSS. Every other block
 * keeps rendering its own tag. Memoized per content object and locale.
 *
 * Blocks are found in `data.blocks`, their children and their component options (columns, tabs,
 * custom components with block options...). Symbols render their own Content, so the walk stops
 * at their options. A block the walk misses just renders its own tag.
 */
export const getContentBlockStyles = (
  content: BuilderContent | null | undefined,
  locale: string | undefined
): ContentBlockStyles => {
  if (!content) return EMPTY_CONTENT_BLOCK_STYLES;

  const localeKey = locale ?? '';
  const cached = CONTENT_BLOCK_STYLES.get(content);
  if (cached && cached.locale === localeKey) return cached.value;

  const cssById = new Map<string, string>();
  const excludedIds = new Set<string>();

  const exclude = (id: string) => {
    excludedIds.add(id);
    cssById.delete(id);
  };

  const visitBlock = (block: BuilderBlock) => {
    const id = block.id;
    if (!id) {
      // Not collected, but its children still can be.
      walkBlocks(block.children);
      walkOptions(block);
      return;
    }

    if (hasBindings(block) || block.repeat?.collection) {
      exclude(id);
      walkBlocks(block.children);
      walkOptions(block);
      return;
    }

    const processed = getProcessedBlock({
      block,
      localState: {},
      rootState: { locale },
      rootSetState: undefined,
      context: {},
    });

    const isShown =
      ('show' in processed ? processed.show : true) &&
      !('hide' in processed ? processed.hide : false);

    const css =
      isShown && canShowBlockStyles(processed)
        ? getBlockStylesCss(processed, content)
        : '';

    if (!excludedIds.has(id)) {
      const existing = cssById.get(id);
      if (existing === undefined) {
        cssById.set(id, css);
      } else if (existing !== css) {
        exclude(id);
      }
    }

    // A hidden block renders nothing, so neither do its children.
    if (!isShown) return;

    walkBlocks(processed.children);
    walkOptions(processed);
  };

  const walkBlocks = (blocks: BuilderBlock[] | undefined) => {
    if (!Array.isArray(blocks)) return;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block && typeof block === 'object') visitBlock(block);
    }
  };

  const walkOptions = (block: BuilderBlock) => {
    if (block.component?.name === 'Symbol') return;
    walkValue(block.component?.options);
  };

  const walkValue = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) walkValue(value[i]);
      return;
    }
    if ((value as BuilderBlock)['@type'] === BUILDER_ELEMENT_TYPE) {
      visitBlock(value as BuilderBlock);
      return;
    }
    for (const key in value) walkValue((value as Record<string, unknown>)[key]);
  };

  walkBlocks(content.data?.blocks);

  let css = '';
  for (const blockCss of cssById.values()) {
    if (blockCss) css += (css ? ' ' : '') + blockCss;
  }
  const value: ContentBlockStyles = { css, ids: new Set(cssById.keys()) };
  CONTENT_BLOCK_STYLES.set(content, { locale: localeKey, value });
  return value;
};

/**
 * Whether this block's CSS is in its Content's stylesheet (see `getContentBlockStyles`).
 */
export const isInContentBlockStyles = (
  block: BuilderBlock,
  content: BuilderContent | null | undefined,
  locale: string | undefined
): boolean =>
  !!block.id &&
  !hasBindings(block) &&
  !block.repeat?.collection &&
  getContentBlockStyles(content, locale).ids.has(block.id);
