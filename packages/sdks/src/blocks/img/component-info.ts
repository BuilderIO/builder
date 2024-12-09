import { IMAGE_FILE_TYPES } from '../../constants/file-types.js';
import type { ComponentInfo } from '../../types/components.js';

export const componentInfo: ComponentInfo = {
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
      allowedFileTypes: IMAGE_FILE_TYPES,
      required: true,
    },
  ],
  noWrap: true,
  static: true,
};
