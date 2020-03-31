import React from 'react'
import { LocaleDialog } from '../src/components/localeDialog'
import LocalePicker from '../src/components/localePicker'
import { shallow } from 'enzyme'
import { Dialog, IconButton } from '@material-ui/core'

describe('Locale Dialog', () => {
  it('passes props to locale picker', () => {
    const props = { a: 1, b: null }
    const wrapper = shallow(<LocaleDialog {...props} />)

    expect(wrapper.find(LocalePicker).props()).toMatchObject(props)
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
    wrapper.find(IconButton).prop('onClick')(null)

    expect(spy).toHaveBeenCalledWith(false)
  })
})
