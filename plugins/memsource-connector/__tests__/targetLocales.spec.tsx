import React from 'react'
import { TargetLocales } from '../src/components/targetLocales'
import { mount } from 'enzyme'
import { Checkbox } from '@material-ui/core'
jest.mock('../src/services/memsourceService')
const spy = jest.fn()

describe('Target Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('given there are no target locales', () => {
    it('should not show any checkboxes', () => {
      const wrapper = mount(<TargetLocales />)

      expect(wrapper.find(Checkbox)).toHaveLength(0)
    })
  })

  describe('given there actually are target locales', () => {
    it('should show as many options as target locales', () => {
      const wrapper = mount(
        <TargetLocales targetLocales={['target-1', 'target-2']} />
      )

      expect(wrapper.find(Checkbox)).toHaveLength(2)
    })

    describe('when selecting a target locale', () => {
      it('fires off the dispatch', () => {
        const spy = jest.fn()

        const wrapper = mount(
          <TargetLocales
            targetLocales={['target-1', 'target-2']}
            dispatch={spy}
          />
        )

        wrapper
          .find(Checkbox)
          .first()
          .prop('onChange')({
          target: { name: 'target-1', checked: true }
        })

        expect(spy).toHaveBeenCalledWith({ locale: 'target-1', checked: true })
      })
    })
  })
})
