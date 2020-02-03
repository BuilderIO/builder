// @ts-ignore
import React from 'react'
import * as dropdownPropsExtractor from '../src/dropdownPropsExtractor'
import { render, waitForDomChange } from '@testing-library/react'
import { Dropdown } from '../src/dropdown'

describe('Dropdown plugin', () => {
  it('should render None option', async () => {
    jest
      .spyOn(dropdownPropsExtractor, 'getMassagedProps')
      .mockImplementation(() => ({
        url: 'url',
        mapper: () => {}
      }))

    fetch.mockResponse(() => ({}))
    const dropdownProps = {
      context: { designerState: { editingContentModel: { data: {} } } }
    }

    const { container } = render(<Dropdown {...dropdownProps} />)

    await waitForDomChange()
  })
})
