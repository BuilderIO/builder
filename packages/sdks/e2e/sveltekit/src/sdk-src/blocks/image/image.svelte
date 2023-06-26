<script context="module" lang="ts">
  export interface ImageProps {
    className?: string;
    image: string;
    sizes?: string;
    lazy?: boolean;
    height?: number;
    width?: number;
    altText?: string;
    backgroundSize?: 'cover' | 'contain';
    backgroundPosition?: string;
    srcset?: string;
    aspectRatio?: number;
    children?: JSX.Element;
    fitContent?: boolean;
    builderBlock?: BuilderBlock;
    noWebp?: boolean;
    src?: string;
  }
</script>

<script lang="ts">
  import type { BuilderBlock } from '../../types/builder-block.js';
  import { getSrcSet } from './image.helpers.js';

  export let image: ImageProps['image'];
  export let src: ImageProps['src'];
  export let srcset: ImageProps['srcset'];
  export let noWebp: ImageProps['noWebp'];
  export let aspectRatio: ImageProps['aspectRatio'];
  export let altText: ImageProps['altText'];
  export let backgroundPosition: ImageProps['backgroundPosition'];
  export let backgroundSize: ImageProps['backgroundSize'];
  export let className: ImageProps['className'];
  export let sizes: ImageProps['sizes'];
  export let builderBlock: ImageProps['builderBlock'];
  export let fitContent: ImageProps['fitContent'];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith('--')) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }

  $: srcSetToUse = () => {
    const imageToUse = image || src;
    const url = imageToUse;

    if (
      !url || // We can auto add srcset for cdn.builder.io and shopify
      // images, otherwise you can supply this prop manually
      !(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))
    ) {
      return srcset;
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
  };

  $: webpSrcSet = () => {
    if (srcSetToUse?.()?.match(/builder\.io/) && !noWebp) {
      return srcSetToUse().replace(/\?/g, '?format=webp&');
    } else {
      return '';
    }
  };

  $: aspectRatioCss = () => {
    const aspectRatioStyles = {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: '0px',
      top: '0px',
    } as const;
    const out = aspectRatio ? aspectRatioStyles : undefined;
    return out;
  };
</script>

<picture>
  {#if webpSrcSet()}
    <source type="image/webp" srcset={webpSrcSet()} />
  {/if}
  <img
    use:mitosis_styling={{
      objectPosition: backgroundPosition || 'center',
      objectFit: backgroundSize || 'cover',
      ...aspectRatioCss(),
    }}
    loading="lazy"
    alt={altText}
    role={altText ? 'presentation' : undefined}
    class={'builder-image' + (className ? ' ' + className : '') + ' img'}
    src={image}
    srcset={srcSetToUse()}
    {sizes}
  />
</picture>

{#if aspectRatio && !(builderBlock?.children?.length && fitContent)}
  <div
    use:mitosis_styling={{
      paddingTop: aspectRatio * 100 + '%',
    }}
    class="builder-image-sizer div"
  />
{/if}

{#if builderBlock?.children?.length && fitContent}
  <slot />
{/if}

{#if !fitContent && $$slots.default}
  <div class="div-2">
    <slot />
  </div>
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
