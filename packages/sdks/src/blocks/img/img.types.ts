import type { BuilderBlock } from "../../types/builder-block";

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
    highPriority?: boolean;
    className?: string;
    sizes?: string;
    lazy?: boolean;
    height?: number;
    width?: number;
    srcset?: string;
    lockAspectRatio?: boolean;
    children?: any;
    fitContent?: boolean;
    builderBlock?: BuilderBlock;
    noWebp?: boolean;
    src?: string;
  }