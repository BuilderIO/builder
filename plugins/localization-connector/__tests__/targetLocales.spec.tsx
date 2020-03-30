import React from 'react'
import { TargetLocales } from '../src/components/targetLocales'
import { mount } from 'enzyme'
import { Button, Checkbox } from '@material-ui/core'
import { MemsourceService } from '../src/services/memsourceService'
jest.mock('../src/services/memsourceService')
const spy = jest.fn()

describe('Target Locales', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('given there are no target locales', () => {
    it('should not show any checkboxes', () => {
      const wrapper = mount(<TargetLocales sourceLocale="source" />)

      expect(wrapper.find(Checkbox)).toHaveLength(0)
    })
  })

  describe('Given no locales have been selected', () => {
    it('Submit button should be disabled', () => {
      const wrapper = mount(
        <TargetLocales
          sourceLocale="source"
          targetLocales={['target-1', 'target-2']}
        />
      )

      expect(wrapper.find(Button).prop('disabled')).toBeTruthy()
    })
  })

  describe('when submitting job to memsource', () => {
    it('should send to memsource selected locales', () => {
      MemsourceService.prototype.sendTranslationJob = spy
      const wrapper = mount(
        <TargetLocales
          sourceLocale="source"
          targetLocales={['target-1', 'target-2']}
        />
      )

      wrapper
        .find('input')
        .find({ name: 'target-1' })
        .simulate('change', {
          target: { name: 'target-1', checked: true }
        })

      wrapper.find(Button).simulate('click')

      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        'source',
        ['target-1'],
        expect.anything()
      )
    })

    it('should not send unchecked locales', () => {
      MemsourceService.prototype.sendTranslationJob = spy
      const wrapper = mount(
        <TargetLocales
          sourceLocale="source"
          targetLocales={['target-1', 'target-2']}
        />
      )

      wrapper
        .find('input')
        .find({ name: 'target-1' })
        .simulate('change', {
          target: { name: 'target-1', checked: true }
        })

      wrapper
        .find('input')
        .find({ name: 'target-2' })
        .simulate('change', {
          target: { name: 'target-2', checked: true }
        })

      wrapper
        .find('input')
        .find({ name: 'target-1' })
        .simulate('change', {
          target: { name: 'target-1', checked: false }
        })

      wrapper.find(Button).simulate('click')

      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        'source',
        ['target-2'],
        expect.anything()
      )
    })
  })
})
