import { isEditing } from '../../functions/is-editing.js';
import '@builder.io/mitosis';

export interface ImgProps {
  attributes?: any;
  imgSrc?: string;
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
      {...props.attributes}
      key={(isEditing() && props.imgSrc) || 'default-key'}
      alt={props.altText}
      src={props.imgSrc}
    />
  );
}
