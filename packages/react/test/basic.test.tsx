/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { Builder, builder } from '@builder.io/sdk';
import { BuilderPage } from '../src/builder-react';
import { el, block } from './functions/render-block';
import * as reactTestRenderer from 'react-test-renderer';
import { getBuilderPixel } from '../src/functions/get-builder-pixel';

builder.init('null');

describe('Dummy test', () => {
  it('tests run correctly', () => {
    expect(true).toBeTruthy();
  });
});

const server = (cb: () => void) => {
  Builder.isServer = true;
  try {
    cb();
  } finally {
    Builder.isServer = false;
  }
};

describe('Renders tons of components', () => {
  const blocks = [
    block('Columns', {
      columns: [{ blocks: [el()] }, { blocks: [el()] }],
    }),
    block('CustomCode', {
      code: '<!-- hello -->',
    }),
    block('Embed', {
      content: '<!-- hello -->',
    }),
    block('Symbol'),
    block('Router'),
    block('Image', { image: 'foobar' }),
    block('Form:Form'),
    block('Video', { video: 'foobar' }),
    block('Button', { text: 'foobar' }),
    block('Section', null, { children: [el()] }),
    block('Form:SubmitButton', { text: 'foobar' }),
    block('Form:Input', { type: 'text' }),
    block('Form:Label'),
    block('Form:Select'),
    block('Form:TextArea', { placeholder: 'foobar' }),
    block('Raw:Img', { image: 'foobar' }),
  ];

  const getRenderExampleElement = () => (
    <BuilderPage
      model="page"
      content={{
        data: {
          blocks: blocks,
        },
      }}
    />
  );

  it('works with dom', () => {
    const testApi = render(getRenderExampleElement());
  });
  it('works with SSR', () => {
    renderToString(getRenderExampleElement());
  });
});

describe('Data rendering', () => {
  const TEXT_STRING = 'Hello 1234';
  const bindingBlock = el({
    bindings: {
      'component.options.text': 'state.foo',
    },
    component: {
      name: 'Text',
    },
  });

  const getBindingExampleElement = () => (
    <BuilderPage
      model="page"
      data={{ foo: TEXT_STRING }}
      content={{
        data: {
          blocks: [bindingBlock],
        },
      }}
    />
  );

  it('works with dom', () => {
    const testApi = render(getBindingExampleElement());
    expect(testApi.getByText(TEXT_STRING)).toBeInTheDocument();
  });

  it('works with SSR', () => {
    server(() => {
      const renderedString = renderToString(getBindingExampleElement());
      expect(renderedString).toContain(TEXT_STRING);
    });
  });
});

describe('Content changes when new content provided', () => {
  const textA = 'textA';
  const textB = 'textB';
  const idA = 'id-a';
  const idB = 'id-b';

  it('Handles content passed and changed correctly', () => {
    const testApi = render(
      <BuilderPage
        model="page"
        content={{
          id: idA,
          data: {
            blocks: [block('Text', { text: textA })],
          },
        }}
      />
    );

    expect(testApi.getByText(textA)).toBeInTheDocument();

    testApi.rerender(
      <BuilderPage
        model="page"
        content={{
          id: idB,
          data: {
            blocks: [block('Text', { text: textB })],
          },
        }}
      />
    );
    expect(testApi.getByText(textB)).toBeInTheDocument();
  });

  it('Should be in controlled mode for null or underined content', () => {
    const testApi = render(<BuilderPage model="page" content={undefined} />);

    expect(testApi.queryByText(textB)).toBeNull();

    testApi.rerender(
      <BuilderPage
        model="page"
        content={{
          id: idB,
          data: {
            blocks: [block('Text', { text: textB })],
          },
        }}
      />
    );
    expect(testApi.getByText(textB)).toBeInTheDocument();
  });

  it('Should be in controlled mode for null or underined content', () => {
    const testApi = render(<BuilderPage model="page" />);

    expect(testApi.queryByText(textB)).toBeNull();

    testApi.rerender(
      <BuilderPage
        model="page"
        content={{
          id: idB,
          data: {
            blocks: [block('Text', { text: textB })],
          },
        }}
      />
    );
    expect(testApi.getByText(textB)).toBeInTheDocument();
  });
});

describe('Builder Pixel', () => {
  it('Should NOT be added if blocks array is empty', () => {
    const renderedBlock = reactTestRenderer.create(
      <BuilderPage
        model="page"
        content={{
          id: 'id',
          data: {
            blocks: [],
          },
        }}
      />
    );

    expect(renderedBlock).toMatchSnapshot();
  });

  it('Should NOT be added again if already present in blocks array', () => {
    const renderedBlock = reactTestRenderer.create(
      <BuilderPage
        model="page"
        content={{
          id: 'id',
          data: {
            blocks: [getBuilderPixel('null')],
          },
        }}
      />
    );

    expect(renderedBlock).toMatchSnapshot();
  });

  it('Should be added if pixel is missing and blocks array has other block(s)', () => {
    const renderedBlock = reactTestRenderer.create(
      <BuilderPage
        model="page"
        content={{
          id: 'id',
          data: {
            blocks: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                id: 'builder-270035a08d734ae88ea177daff3595c0',
                component: {
                  name: 'Text',
                  options: {
                    text: '<p>some text...</p>',
                  },
                },
                responsiveStyles: {
                  large: {
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    flexShrink: '0',
                    boxSizing: 'border-box',
                    marginTop: '20px',
                    lineHeight: 'normal',
                    height: 'auto',
                  },
                },
              },
            ],
          },
        }}
      />
    );

    expect(renderedBlock).toMatchSnapshot();
  });
});
