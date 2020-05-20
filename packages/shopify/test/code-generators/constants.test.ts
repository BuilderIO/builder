import { sizes } from '../../src/constants/sizes';

describe('Constants', () => {
  test('sizes are consistent', () => {
    const { xsmall, small, medium, large } = sizes;

    expect(xsmall).toMatchSnapshot();
    expect(small).toMatchSnapshot();
    expect(medium).toMatchSnapshot();
    expect(large).toMatchSnapshot();
  });

  test('getWidthForSize', () => {
    const testSize = sizes.getSizeForWidth(235);
    expect(testSize).toMatchSnapshot();
  });
});
