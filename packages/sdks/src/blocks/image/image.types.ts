import type { BuilderBlock } from '../../types/builder-block.js';

export interface ImageProps {
  attributes?: string;
  highPriority?: boolean;
  className?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: 'cover' | 'contain';
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  lockAspectRatio?: boolean;
  children?: any;
  fitContent?: boolean;
  builderBlock?: BuilderBlock;
  noWebp?: boolean;
  src?: string;
}
