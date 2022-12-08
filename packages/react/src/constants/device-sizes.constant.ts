import { fastClone } from '../functions/utils';

export type Size = 'large' | 'medium' | 'small' | 'xsmall';
export const sizeNames: Size[] = ['xsmall', 'small', 'medium', 'large'];

// TODO: put in @builder.io/core
const sizes = {
  xsmall: {
    min: 0,
    default: 0,
    max: 0,
  },
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
  getWidthForSize(size: Size) {
    return this[size].default;
  },
  getSizeForWidth(width: number) {
    for (const size of sizeNames) {
      const value = this[size];
      if (width <= value.max) {
        return size;
      }
    }
    return 'large';
  },
};
export type Sizes = typeof sizes;

export interface Breakpoints {
  small?: number;
  medium?: number;
}

export const getSizesForBreakpoints = ({ small, medium }: Breakpoints) => {
  const newSizes = {
    ...sizes, // Note: this helps get the function from sizes
    ...fastClone(sizes), // Note: this helps to get a deep clone of fields like small, medium etc
  };

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
