import '@builder.io/mitosis';
import { Builder } from '@builder.io/sdk';
import { registerComponent } from '../functions/register-component';

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
      key={(Builder.isEditing && props.imgSrc) || 'default-key'}
      alt={props.altText}
      src={props.imgSrc}
    />
  );
}

registerComponent({
  // friendlyName?
  name: 'Raw:Img',
  hideFromInsertMenu: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  inputs: [
    {
      name: 'image',
      bubble: true,
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
    },
  ],
  noWrap: true,
  static: true,
});
