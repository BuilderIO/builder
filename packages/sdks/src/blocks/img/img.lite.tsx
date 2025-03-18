import { useMetadata, useTarget } from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import { filterAttrs } from '../helpers.js';
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
}

export default function ImgComponent(props: ImgProps) {
  return (
    <img
      style={{
        objectFit: props.backgroundSize || 'cover',
        objectPosition: props.backgroundPosition || 'center',
      }}
      key={(isEditing() && props.imgSrc) || 'default-key'}
      alt={props.altText}
      src={props.imgSrc || props.image}
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', false),
        svelte: filterAttrs(props.attributes, 'on:', false),
        default: {},
      })}
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', true),
        svelte: filterAttrs(props.attributes, 'on:', true),
        default: props.attributes,
      })}
    />
  );
}
