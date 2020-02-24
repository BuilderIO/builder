// @ts-ignore
import React from 'react'
import { Component } from '../src/dropdown'
import * as selectionsClient from '../src/selectionsClient'
import * as mapperEvaluator from '../src/mapperEvaluator'
import {
  render,
  wait,
  waitForDomChange,
  cleanup,
  act
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import * as propsExtractor from '../src/dropdownPropsExtractor'
import { Simulate } from 'react-dom/test-utils'

jest.mock('@material-ui/core/TextField', () => (props: any) => {
  const { children, value, onChange } = props
  const handleChange = (event: any) => {
    onChange(event)
  }

  return (
    <select data-testid="custom-select" value={value} onChange={handleChange}>
      {children}
    </select>
  )
})

describe('Dropdown plugin', () => {
  const spy = jest.fn()
  const dropdownProps: any = { context: { designerState: {} }, onChange: spy }

  let safeEvaluatorSpy: jest.SpyInstance<any, [String, any?]>

  beforeAll(() => {
    jest
      .spyOn(propsExtractor, 'getMassagedProps')
      .mockReturnValue({ url: 'a-url', mapper: 'a-mapper' })

    jest
      .spyOn(selectionsClient, 'executeGet')
      .mockResolvedValue({ data: [{ key: 'key-1', value: 'value-1' }] })

    safeEvaluatorSpy = jest.spyOn(mapperEvaluator, 'safeEvaluate')
  })

  beforeEach(() => {
    spy.mockClear()
    safeEvaluatorSpy.mockClear()
  })

  afterEach(cleanup)

  it('adds mapped values', async () => {
    safeEvaluatorSpy.mockReturnValueOnce([
      { key: 'any-key', name: 'any-value' }
    ])

    const { getByText } = render(<Component {...dropdownProps} />)

    await wait(() => {
      expect(getByText('None')).toBeInTheDocument()
      expect(getByText('any-value')).toBeInTheDocument()
    })
  })

  it('shows None option', async () => {
    safeEvaluatorSpy.mockReturnValueOnce([])

    const { getByText } = render(<Component {...dropdownProps} />)

    expect(getByText('None')).toBeInTheDocument()
  })

  it('updates value on item update', async () => {
    safeEvaluatorSpy.mockReturnValue([
      { key: 'key-1', name: 'value-1' },
      { key: 'key-3', name: 'value-3' },
      { key: 'key-2', name: 'value-2' },
      { key: 'key-3', name: 'value-3' }
    ])

    await act(async () => {
      const { container } = render(<Component {...dropdownProps} />)
      await waitForDomChange()
      const element: any = container.querySelector('select')
      const evt: any = { target: { value: 'value-2' } }
      Simulate.change(element, evt)
    })

    await wait(() => {
      expect(spy).toHaveBeenCalledWith('value-2')
    })
  })

  it('shows None even when safe evaluate throws', () => {
    const dropdownProps = { context: { designerState: {} } }

    safeEvaluatorSpy.mockImplementation(() => {
      throw new Error()
    })

    const { getByText } = render(<Component {...dropdownProps} />)

    expect(getByText('None')).toBeInTheDocument()
  })
})
