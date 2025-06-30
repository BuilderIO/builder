import { useMetadata, useStore, useTarget } from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import { filterAttrs } from '../helpers.js';
import { getSrcSet } from '../image/image.helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

import { getClassPropName } from '../../functions/get-class-prop-name.js';

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
    get imgAttrs() {
      const attrs = {
        ...useTarget({
          vue: filterAttrs(props.attributes, 'v-on:', false),
          svelte: filterAttrs(props.attributes, 'on:', false),
          default: props.attributes,
        }),
        ...useTarget({
          vue: filterAttrs(props.attributes, 'v-on:', true),
          svelte: filterAttrs(props.attributes, 'on:', true),
          default: {},
        }),
        [getClassPropName()]: `builder-raw-img ${props.attributes[getClassPropName()] || ''}`,
      } as Record<string, any>;
      delete attrs.style;

      return attrs;
    },
  });

  return (
    <img
      loading="lazy"
      key={(isEditing() && props.imgSrc) || 'default-key'}
      alt={props.altText}
      title={props.title}
      src={props.imgSrc || props.image}
      {...state.imgAttrs}
      style={{
        objectFit: props.backgroundSize || 'cover',
        objectPosition: props.backgroundPosition || 'center',
        aspectRatio: props.aspectRatio || undefined,
        ...(props.attributes?.style || {}),
      }}
    />
  );
}