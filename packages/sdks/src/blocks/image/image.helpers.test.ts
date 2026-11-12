import { getSrcSet, getWebpSrcSet } from './image.helpers.js';

const IMAGE_URL = 'https://cdn.builder.io/api/v1/image/assets%2Fabc%2Fdef';

describe('getWebpSrcSet', () => {
  test('converts every candidate generated for an image url without a query string', () => {
    const candidates = getWebpSrcSet(getSrcSet(IMAGE_URL)).split(', ');

    expect(candidates).toHaveLength(8);
    expect(candidates[0]).toBe(`${IMAGE_URL}?format=webp&width=100 100w`);
    expect(candidates[7]).toBe(`${IMAGE_URL}?format=webp`);
  });

  test('converts every candidate generated for an image url with a width', () => {
    const srcset = getWebpSrcSet(getSrcSet(`${IMAGE_URL}?width=1003`));

    expect(srcset).toContain(`${IMAGE_URL}?format=webp&width=100 100w`);
    expect(srcset.endsWith(`${IMAGE_URL}?format=webp&width=1003 1003w`)).toBe(
      true
    );
  });

  test.each([
    [
      'no query strings',
      'a.png 1x, b.png 2x',
      'a.png?format=webp 1x, b.png?format=webp 2x',
    ],
    [
      'no descriptors',
      'a.png, b.png?w=1',
      'a.png?format=webp, b.png?format=webp&w=1',
    ],
    [
      'no space after a comma',
      'a.png?w=1 1x,b.png 2x',
      'a.png?format=webp&w=1 1x,b.png?format=webp 2x',
    ],
    [
      'commas inside a url',
      'a.png?fit=x,y 1x, b.png 2x',
      'a.png?format=webp&fit=x,y 1x, b.png?format=webp 2x',
    ],
    [
      'multiple descriptors',
      'a.png 100w 50h, b.png',
      'a.png?format=webp 100w 50h, b.png?format=webp',
    ],
  ])('handles a srcset with %s', (_, srcset, expected) => {
    expect(getWebpSrcSet(srcset)).toBe(expected);
  });
});
