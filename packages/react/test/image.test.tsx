import * as React from 'react';
import { Image } from '../src/blocks/Image';
import * as reactTestRenderer from 'react-test-renderer';
import { block } from './functions/render-block';
import { BuilderPage } from '../src/builder-react';

describe('Image', () => {
  it('Builder image url', () => {
    const tree = reactTestRenderer
      .create(
        <Image image="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F755c131471fb49ab91dc0bdc45bc85b5?width=1003" />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Builder image url with width', () => {
    const tree = reactTestRenderer
      .create(
        <Image image="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F755c131471fb49ab91dc0bdc45bc85b5?width=1003" />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shopify image url', () => {
    const tree = reactTestRenderer
      .create(
        <Image image="https://cdn.shopify.com/s/files/1/0374/6457/2041/products/valerie-elash-o1Ic6JdypmA-unsplash.jpg?v=1592506853" />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Amp image', () => {
    const imageBlock = block(
      'Image',
      {
        image:
          'https://cdn.shopify.com/s/files/1/0374/6457/2041/products/valerie-elash-o1Ic6JdypmA-unsplash.jpg?v=1592506853',
      },
      {
        responsiveStyles: {
          large: {
            width: '345px',
          },
          medium: {
            width: '100%',
          },
        },
      },
      1234
    );

    const renderedBlock = reactTestRenderer
      .create(
        <BuilderPage
          model="page"
          ampMode
          content={{
            data: {
              blocks: [imageBlock],
            },
          }}
        />
      )
      .toJSON();

    expect(renderedBlock).toMatchSnapshot();
  });

  it('Lazy load', () => {
    const tree = reactTestRenderer
      .create(
        <Image
          image="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F755c131471fb49ab91dc0bdc45bc85b5?width=1003"
          lazy
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('with sizes, srcset, and alt', () => {
    const tree = reactTestRenderer
      .create(
        <Image
          sizes="(max-width: 600px) 67vw, 92vw"
          srcset="nosrcset"
          altText="this great image"
          image="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F755c131471fb49ab91dc0bdc45bc85b5?width=1003"
          amp="true"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('with responsive styles', () => {
    const imageBlock = block(
      'Image',
      {
        image:
          'https://cdn.shopify.com/s/files/1/0374/6457/2041/products/valerie-elash-o1Ic6JdypmA-unsplash.jpg?v=1592506853',
      },
      {
        responsiveStyles: {
          large: {
            width: '345px',
          },
          medium: {
            width: '100%',
          },
        },
      },
      1234
    );

    const renderedBlock = reactTestRenderer
      .create(
        <BuilderPage
          model="page"
          content={{
            data: {
              blocks: [imageBlock],
            },
          }}
        />
      )
      .toJSON();

    expect(renderedBlock).toMatchSnapshot();
  });
});
