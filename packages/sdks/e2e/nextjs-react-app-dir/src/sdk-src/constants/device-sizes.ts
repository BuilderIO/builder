import { fastClone } from '../functions/fast-clone';
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

export const getMaxWidthQueryForSize = (size: SizeName, sizeValues = SIZES) =>
  `@media (max-width: ${sizeValues[size].max}px)`;

interface Breakpoints {
  small?: number;
  medium?: number;
}

export const getSizesForBreakpoints = ({ small, medium }: Breakpoints) => {
  const newSizes = fastClone(SIZES); // Note: this helps to get a deep clone of fields like small, medium etc

  if (!small || !medium) {
    return newSizes;
  }

  const smallMin = Math.floor(small / 2);
  newSizes.small = {
    max: small,
    min: smallMin,
    default: smallMin + 1,
  };

  const mediumMin = newSizes.small.max + 1;
  newSizes.medium = {
    max: medium,
    min: mediumMin,
    default: mediumMin + 1,
  };

  const largeMin = newSizes.medium.max + 1;
  newSizes.large = {
    max: 2000, // TODO: decide upper limit
    min: largeMin,
    default: largeMin + 1,
  };

  return newSizes;
};
