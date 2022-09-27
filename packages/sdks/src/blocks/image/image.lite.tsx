import { Show, useStore } from '@builder.io/mitosis';
import type { JSX } from '@builder.io/mitosis/jsx-runtime';
import type { BuilderBlock } from '../../types/builder-block.js';
import { getSrcSet } from './image.helpers.js';

export interface ImageProps {
  className?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  children?: JSX.Element;
  fitContent?: boolean;
  builderBlock?: BuilderBlock;
  noWebp?: boolean;
  src?: string;
}

export default function Image(props: ImageProps) {
  const state = useStore({
    get srcSetToUse(): string | undefined {
      const imageToUse = props.image || props.src;
      const url = imageToUse;
      if (
        !url ||
        // We can auto add srcset for cdn.builder.io and shopify
        // images, otherwise you can supply this prop manually
        !(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))
      ) {
        return props.srcset;
      }

      if (props.srcset && props.image?.includes('builder.io/api/v1/image')) {
        if (!props.srcset.includes(props.image.split('?')[0])) {
          console.debug('Removed given srcset');
          return getSrcSet(url);
        }
      } else if (props.image && !props.srcset) {
        return getSrcSet(url);
      }

      return getSrcSet(url);
    },
    get webpSrcSet() {
      if (state.srcSetToUse?.match(/builder\.io/) && !props.noWebp) {
        return state.srcSetToUse.replace(/\?/g, '?format=webp&');
      } else {
        return '';
      }
    },
  });
  return (
    <>
      <picture>
        <Show when={state.webpSrcSet}>
          <source srcset={state.webpSrcSet} type="image/webp" />
        </Show>
        <img
          loading="lazy"
          alt={props.altText}
          role={props.altText ? 'presentation' : undefined}
          css={{
            opacity: '1',
            transition: 'opacity 0.2s ease-in-out',
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: '0px',
            left: '0px',
          }}
          style={{
            objectPosition: props.backgroundSize || 'center',
            objectFit: props.backgroundSize || 'cover',
          }}
          class={
            'builder-image' + (props.className ? ' ' + props.className : '')
          }
          src={props.image}
          // TODO: memoize on image on client
          srcset={state.srcSetToUse}
          sizes={props.sizes}
        />
        <source srcset={state.srcSetToUse} />
      </picture>

      {/* preserve aspect ratio trick. Only applies when there are no children meant to fit the content width. */}
      <Show
        when={
          props.aspectRatio &&
          !(props.builderBlock?.children?.length && props.fitContent)
        }
      >
        <div
          class="builder-image-sizer"
          style={{
            paddingTop:
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              props.aspectRatio! * 100 + '%',
          }}
          css={{
            width: '100%',
            pointerEvents: 'none',
            fontSize: '0',
          }}
        />
      </Show>

      <Show when={props.builderBlock?.children?.length && props.fitContent}>
        {props.children}
      </Show>

      {/* When `fitContent: false`, we wrap image children ssuch that they stretch across the entire image  */}
      <Show when={!props.fitContent && props.children}>
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }}
        >
          {props.children}
        </div>
      </Show>
    </>
  );
}
