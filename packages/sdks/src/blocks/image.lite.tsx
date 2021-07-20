import {} from '@jsx-lite/core';
import { registerComponent } from '../functions/register-component';

export interface ImageProps {
  class?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  // TODO: Support generating Builder.io and or Shopify `srcset`s when needed
  srcset?: string;
  // TODO: Implement support for custom aspect ratios
  aspectRatio?: number;
  // TODO: This might not work as expected in terms of positioning
  children?: any;
}

export default function Image(props: ImageProps) {
  return (
    <>
      <picture>
        <img
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? 'presentation' : undefined}
          css={{
            opacity: '1',
            transition: 'opacity 0.2s ease-in-out',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          class={'builder-image' + (props.class ? ' ' + props.class : '')}
          src={props.image}
          // TODO: memoize on image on client
          srcset={props.srcset}
          sizes={props.sizes}
        />
        <source srcSet={props.srcset} />
      </picture>
      {props.children}
    </>
  );
}

registerComponent({ name: 'Image' });
