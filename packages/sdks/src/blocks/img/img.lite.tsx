import { useTarget } from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import { filterVueAttrs } from '../helpers.js';

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
        vue2: {
          ...filterVueAttrs(props.attributes, true),
          ...filterVueAttrs(props.attributes, false),
        },
        vue3: {
          ...filterVueAttrs(props.attributes, true),
          ...filterVueAttrs(props.attributes, false),
        },
        default: props.attributes,
      })}
    />
  );
}
