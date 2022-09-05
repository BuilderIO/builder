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

export const useSizes = ({ small, medium }: { small?: number; medium?: number }) => {
  if (small) {
    sizes.small = {
      max: small,
      default: small / 2,
      min: small / 2 - 1 || 0, // TODO: handle negative values?
    };
  }

  if (medium) {
    sizes.medium = {
      max: medium,
      default: sizes.small.max + 2,
      min: sizes.small.max + 1,
    };
  }
};
