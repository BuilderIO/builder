<script lang="ts">
  import { isEditing } from '../../functions/is-editing.js';
  import { styleString } from '../../helpers/style-string.js';

  interface ImgProps {
    attributes?: any;
    imgSrc?: string; // TODO(misko): I think this is unused
    image?: string;
    altText?: string;
    backgroundSize?: 'cover' | 'contain';
    backgroundPosition?:
      | 'center'
      | 'top'
      | 'left'
      | 'right'
      | 'bottom'
      | 'top left'
      | 'top right'
      | 'bottom left'
      | 'bottom right';
    aspectRatio?: number;
    title?: string;
  }

  let {
    attributes = {},
    imgSrc,
    image,
    altText,
    backgroundSize,
    backgroundPosition,
    aspectRatio,
    title,
  }: ImgProps = $props();

  // `attributes` carries the block's props and its actions as event attributes (`onclick`).
  const imgAttrs = $derived.by(() => {
    const { style: _style, ...rest } = attributes || {};
    return { ...rest, class: `builder-raw-img ${attributes?.class || ''}` };
  });

  // The block's own style comes in as a string on this target (an object elsewhere).
  const style = $derived.by(() => {
    const blockStyle = attributes?.style;
    const own = styleString({
      objectFit: backgroundSize || 'cover',
      objectPosition: backgroundPosition || 'center',
      aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
      ...(blockStyle && typeof blockStyle === 'object' ? blockStyle : {}),
    });
    return typeof blockStyle === 'string' && blockStyle ? `${own} ${blockStyle}` : own;
  });
</script>

{#key (isEditing() && imgSrc) || 'default-key'}
  <img
    loading="lazy"
    alt={altText}
    {title}
    src={imgSrc || image}
    {...imgAttrs}
    {style}
  />
{/key}
