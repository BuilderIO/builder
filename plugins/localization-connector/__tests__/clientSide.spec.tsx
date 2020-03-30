import React from 'react'
import ReactDOM from 'react-dom/server'
import ClientSide from '../src/components/clientSide'
import { render } from '@testing-library/react'

describe('Client side', () => {
  describe('given is not mounted', () => {
    it('should render nothing', () => {
      const serverRenderedComponent = ReactDOM.renderToString(
        <ClientSide>
          <p>any paragraph</p>
        </ClientSide>
      )
      expect(serverRenderedComponent).toBe('')
    })
  })

  describe('given is mounted', () => {
    it('should render children', () => {
      const { queryByText } = render(
        <ClientSide>
          <p>any paragraph</p>
        </ClientSide>
      )

      expect(queryByText('any paragraph')).toBeInTheDocument()
    })
  })
})
