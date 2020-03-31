import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { render } from '@testing-library/react'
import { BuilderElement, Builder } from '@builder.io/sdk'
import { BuilderPage } from '../src/builder-react'

import '@testing-library/jest-dom/extend-expect'

describe('Dummy test', () => {
  it('tests run correctly', () => {
    expect(true).toBeTruthy()
  })
})

const el = (options?: Partial<BuilderElement>): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  id:
    'builder-' +
    Math.random()
      .toString()
      .split('.')[1],
  ...options
})

const server = (cb: () => void) => {
  Builder.isServer = true;
  try {
    cb()
  } finally {
    Builder.isServer = false;
  }
}

describe('Renders tons of components', () => {
  const block = (name: string, options?: any, elOptions?: Partial<BuilderElement>) =>
    el({
      ...elOptions,
      component: {
        name,
        options
      }
    })
  const blocks = [
    block('Columns', {
      columns: [{ blocks: [el()] }, { blocks: [el()] }]
    }),
    block('CustomCode', {
      code: '<!-- hello -->'
    }),
    block('Embed', {
      content: '<!-- hello -->'
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
    block('Raw:Img', { image: 'foobar' })
  ]

  const getRenderExampleElement = () => (
    <BuilderPage
      model="page"
      content={{
        data: {
          blocks: blocks
        }
      }}
    />
  )

  it('works with dom', () => {
    const testApi = render(getRenderExampleElement())
  })
  it('works with SSR', () => {
    const string = renderToString(getRenderExampleElement())
  })
})

describe('Data rendering', () => {
  const TEXT_STRING = 'Hello 1234'
  const bindingBlock = el({
    bindings: {
      'component.options.text': 'state.foo'
    },
    component: {
      name: 'Text'
    }
  })

  const getBindingExampleElement = () => (
    <BuilderPage
      model="page"
      data={{ foo: TEXT_STRING }}
      content={{
        data: {
          blocks: [bindingBlock]
        }
      }}
    />
  )
  it('works with dom', () => {
    const testApi = render(getBindingExampleElement())
    expect(testApi.getByText(TEXT_STRING)).toBeInTheDocument()
  })
  it('works with SSR', () => {
    server(() => {
      const string = renderToString(getBindingExampleElement())
      expect(string).toContain(TEXT_STRING)
    })
  })
})