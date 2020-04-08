import React from 'react'
import { MemsourceConnector } from '../src/plugin'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/'

describe('Memsource connector', () => {
  describe('When rendering', () => {
    it('react displays LOCALIZE button', () => {
      const { getByTestId } = render(<MemsourceConnector />)

      expect(getByTestId('button-localise')).toBeInTheDocument()
    })
  })

  describe('Having clicked on LOCALIZE button', () => {
    describe('Given builder context has not enough configuration for the dialog to show', () => {
      it('Then a warning alert should display when page has no blocks', () => {
        const { getByTestId } = render(<MemsourceConnector />)

        fireEvent.click(getByTestId('button-localise'))

        expect(getByTestId('alert-dialog-message').innerHTML).toBe(
          'Page has no blocks'
        )
      })

      it('Then a warning alert should display when page locale is not eligible to be localised from', () => {
        const ctx = {
          designerState: {
            editingContentModel: {
              data: {
                get: (arg: string) => ({ blocks: { toJSON: () => [{}] } }[arg]),
                toJSON: () => ({ locale: 'unallowed-locale-1' })
              },
              model: {
                fields: [
                  {
                    name: 'allowedLocales',
                    enum: { toJSON: () => ['allowed-1', 'allowed-2'] }
                  }
                ]
              }
            }
          }
        }
        const { getByTestId } = render(<MemsourceConnector context={ctx} />)

        fireEvent.click(getByTestId('button-localise'))

        expect(getByTestId('alert-dialog-message').innerHTML).toBe(
          'Current locale not allowed to be localised from'
        )
      })
    })
  })
})
