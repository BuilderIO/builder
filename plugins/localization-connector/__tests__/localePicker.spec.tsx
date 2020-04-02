import React from 'react'
import LocalePicker from '../src/components/localePicker'
import { mount } from 'enzyme'
import * as propsExtractor from '../src/services/propsExtractor'
import { SourceLocale } from '../src/components/sourceLocale'
import { TargetLocales } from '../src/components/targetLocales'

describe('Locale picker', () => {
  it('should pass extracted source locale to source locale display', () => {
    const wrapper = mount(<LocalePicker sourceLocale="source-locale" />)

    expect(wrapper.find(SourceLocale).prop('sourceLocale')).toBe(
      'source-locale'
    )
  })

  it('should pass extracted target locales to target locale display', () => {
    const wrapper = mount(
      <LocalePicker targetLocales={['target-1', 'target-2']} />
    )

    expect(wrapper.find(TargetLocales).prop('targetLocales')).toStrictEqual([
      'target-1',
      'target-2'
    ])
  })

  it('should pass dispatch callback to target locales', () => {
    const mock = jest.fn()
    const wrapper = mount(<LocalePicker dispatch={mock} />)

    expect(wrapper.find(TargetLocales).prop('dispatch')).toEqual(mock)
  })
})
