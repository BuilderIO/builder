export type SizeName = 'large' | 'medium' | 'small';

interface Size {
  min: number;
  default: number;
  max: number;
}

const SIZES: Record<SizeName, Size> = {
  small: {
    min: 320,
    default: 321,
    max: 640,
  },
  medium: {
    min: 641,
    default: 642,
    max: 991,
  },
  large: {
    min: 990,
    default: 991,
    max: 1200,
  },
};

export const getMaxWidthQueryForSize = (size: SizeName) =>
  `@media (max-width: ${SIZES[size].max}px)`;
