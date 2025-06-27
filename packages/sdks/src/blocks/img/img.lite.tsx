import { useMetadata, useStore, useTarget } from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import { filterAttrs } from '../helpers.js';
import { getSrcSet } from '../image/image.helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

import { setAttrs } from '../helpers.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface ImgProps {
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

export default function ImgComponent(props: ImgProps) {
  const state = useStore({
    get srcSetToUse(): string | undefined {
      const url = props.imgSrc || props.image;
      if (!url || typeof url !== 'string') {
        return undefined;
      }

      // We can auto add srcset for cdn.builder.io images
      if (!url.match(/builder\.io/)) {
        return undefined;
      }

      return getSrcSet(url);
    },
    get attributesWithoutClass() {
      if (!props.attributes) {
        return {};
      }
      const { class: _class, className: _className, ...rest } = props.attributes;
      return rest;
    },
    get className() {
      return ['builder-raw-img', props.attributes?.class, props.attributes?.className]
        .filter(Boolean)
        .join(' ');
    },
  });

  return (
    <img
      loading="lazy"
      key={(isEditing() && props.imgSrc) || 'default-key'}
      alt={props.altText}
      title={props.title}
      src={props.imgSrc || props.image}
      srcSet={state.srcSetToUse}
      {...useTarget({
        vue: filterAttrs(state.attributesWithoutClass, 'v-on:', false),
        svelte: filterAttrs(state.attributesWithoutClass, 'on:', false),
        default: {},
      })}
      {...useTarget({
        vue: filterAttrs(state.attributesWithoutClass, 'v-on:', true),
        svelte: filterAttrs(state.attributesWithoutClass, 'on:', true),
        default: state.attributesWithoutClass,
      })}
      style={{
        objectFit: props.backgroundSize,
        objectPosition: props.backgroundPosition,
        aspectRatio: props.aspectRatio,
        ...(props.attributes?.style || {}),
      }}
      class={state.className}
    />
  );
}