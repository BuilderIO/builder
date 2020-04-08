import React from 'react'
import { SourceLocale } from '../src/components/sourceLocale'
import { render } from '@testing-library/react'
describe('Source Locale', () => {
  it.each`
    input
    ${null}
    ${undefined}
  `('given input $input, nothing should be rendered', () => {
    const { getByText } = render(<SourceLocale />)

    expect(getByText(/locale not defined in current model/)).toBeInTheDocument()
  })

  it('given existing source locale, print source locale', () => {
    const { getByText } = render(<SourceLocale sourceLocale="locale-1" />)

    expect(getByText(/Source locale/)).toBeInTheDocument()
    expect(getByText(/locale-1/)).toBeInTheDocument()
  })
})
