import { RawImg } from '../../src/components/raw-img';
import { el } from '../modules/helpers';

const getRawImg = (options: any): string =>
  RawImg(
    el({
      component: {
        options,
        name: 'Raw:Img',
      },
    }),
    {}
  );

describe('Text code generator', () => {
  test('values for all attributes', () => {
    const code = getRawImg({
      image: '/test/img.jpg',
    });

    expect(code).toMatchSnapshot();
  });

});
