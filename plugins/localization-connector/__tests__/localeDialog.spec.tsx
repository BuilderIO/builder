import React from 'react'
import { LocaleDialog } from '../src/components/localeDialog'
import LocalePicker from '../src/components/localePicker'
import { shallow } from 'enzyme'
import { Dialog } from '@material-ui/core'
import MuiDialogTitle from '../src/components/dialogTitle'

describe('Locale Dialog', () => {
  it.skip('passes props to locale picker', () => {
    const props = {
      sourceLocale: 'source-locale',
      targetLocales: ['target-1', 'target-2']
    }
    const wrapper = shallow(<LocaleDialog {...props} />)

    expect(wrapper.find(LocalePicker).props()).toEqual(
      expect.objectContaining({
        ...props,
        dispatch: expect.anything()
      })
    )
  })

  it('triggers setOpen when closing dialog', () => {
    const spy = jest.fn()
    const wrapper = shallow(<LocaleDialog open={true} setOpen={spy} />)
    wrapper.find(Dialog).prop('onClose')({}, 'escapeKeyDown')

    expect(spy).toHaveBeenCalledWith(false)
  })

  it('triggers setOpen when clicking on the close icon', () => {
    const spy = jest.fn()
    const wrapper = shallow(<LocaleDialog open={true} setOpen={spy} />)
    wrapper.find(MuiDialogTitle).prop('onClose')()

    expect(spy).toHaveBeenCalledWith(false)
  })
})
