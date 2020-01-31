import React from 'react'
import { Dropdown } from '../src/dropdown'
import { render } from '@testing-library/react'

describe('Dropdown plugin', () => {
  describe('should throw', () => {
    it('when url does not contain given url', () => {
      try {
        render(<Dropdown props={{ field: { url: {} } }} />)
      } catch (e) {
        console.log('TCL: e', e)
      }
    })
  })
})
