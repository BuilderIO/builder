<script lang="ts">
  import type { Snippet } from 'svelte';
  import { styleString } from '../../helpers/style-string.js';
  import { getSrcSet } from './image.helpers.js';
  import type { ImageProps } from './image.types.js';

  let {
    image,
    src,
    srcset,
    noWebp,
    sizes,
    highPriority,
    altText,
    title,
    backgroundPosition,
    backgroundSize,
    aspectRatio,
    className,
    fitContent,
    builderBlock,
    children,
  }: ImageProps & { children?: Snippet } = $props();

  const srcSetToUse = $derived.by((): string | undefined => {
    const url = image || src;
    if (
      !url ||
      // We can auto add srcset for cdn.builder.io and shopify
      // images, otherwise you can supply this prop manually
      !(typeof url === 'string' && (url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/)))
    ) {
      return srcset;
    }

    if (noWebp) {
      return undefined; // no need to add srcset to svg images
    }

    if (srcset && image?.includes('builder.io/api/v1/image')) {
      if (!srcset.includes(image.split('?')[0])) {
        console.debug('Removed given srcset');
        return getSrcSet(url);
      }
    } else if (image && !srcset) {
      return getSrcSet(url);
    }

    return getSrcSet(url);
  });

  const webpSrcSet = $derived(
    srcSetToUse?.match(/builder\.io/) && !noWebp
      ? srcSetToUse.replace(/\?/g, '?format=webp&')
      : ''
  );

  const sizesToUse = $derived(sizes || (highPriority ? undefined : 'auto'));

  const aspectRatioCss = $derived(
    aspectRatio
      ? { position: 'absolute', height: '100%', width: '100%', left: '0px', top: '0px' }
      : undefined
  );

  const hasChildren = $derived(!!builderBlock?.children?.length);
</script>

<picture>
  {#if webpSrcSet}
    <source srcset={webpSrcSet} sizes={sizesToUse} type="image/webp" />
  {/if}
  <img
    loading={highPriority ? 'eager' : 'lazy'}
    fetchpriority={highPriority ? 'high' : 'auto'}
    alt={altText || ''}
    {title}
    style={styleString({
      objectPosition: `var(--builder-image-position, ${backgroundPosition || 'center'})`,
      objectFit: backgroundSize || 'cover',
      ...aspectRatioCss,
    })}
    class={'builder-image' + (className ? ' ' + className : '') + ' img'}
    src={image}
    srcset={srcSetToUse}
    sizes={sizesToUse}
  />
</picture>

<!-- preserve aspect ratio trick. Only applies when there are no children meant to fit the content width. -->
{#if aspectRatio && !(hasChildren && fitContent)}
  <div class="builder-image-sizer div" style={styleString({ paddingTop: aspectRatio * 100 + '%' })}></div>
{/if}

{#if hasChildren && fitContent}
  {@render children?.()}
{/if}

<!-- When `fitContent: false`, we wrap image children such that they stretch across the entire image -->
{#if !fitContent && hasChildren}
  <div class="div-2">{@render children?.()}</div>
{/if}

<style>
  .img {
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
  }
  .div {
    width: 100%;
    pointer-events: none;
    font-size: 0;
  }
  .div-2 {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
