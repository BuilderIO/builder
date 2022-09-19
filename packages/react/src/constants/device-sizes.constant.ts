import { fastClone } from '../functions/utils';

export type Size = 'large' | 'medium' | 'small' | 'xsmall';
export const sizeNames: Size[] = ['xsmall', 'small', 'medium', 'large'];

// TODO: put in @builder.io/core
export const sizes = {
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

interface Breakpoints {
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

  newSizes.small = {
    max: small,
    min: Math.floor(small / 2),
    default: 0, // Note: For TS
  };
  newSizes.small.default = newSizes.small.min + 1; // TODO: handle negative values?

  newSizes.medium = {
    max: medium,
    min: newSizes.small.max + 1,
    default: 0, // Note: For TS
  };
  newSizes.medium.default = newSizes.medium.min + 1; // TODO: handle negative values?

  newSizes.large = {
    max: 2000, // TODO: decide upper limit
    min: newSizes.medium.max + 1,
    default: 0, // Note: For TS
  };
  newSizes.large.default = newSizes.large.min + 1; // TODO: handle negative values?

  return newSizes;
};
