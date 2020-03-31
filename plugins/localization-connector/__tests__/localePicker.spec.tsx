import React from 'react'
import LocalePicker from '../src/components/localePicker'
import { mount } from 'enzyme'
import * as propsExtractor from '../src/services/propsExtractor'
import { SourceLocale } from '../src/components/sourceLocale'
import { TargetLocales } from '../src/components/targetLocales'

describe('Locale picker', () => {
  it('should pass extracted source locale to source locale display', () => {
    jest
      .spyOn(propsExtractor, 'extractLocales')
      .mockImplementationOnce(() => ['source-locale', []])
    const wrapper = mount(<LocalePicker />)

    expect(wrapper.find(SourceLocale).prop('sourceLocale')).toBe(
      'source-locale'
    )
  })

  it('should pass extracted source locale to target locale display', () => {
    jest
      .spyOn(propsExtractor, 'extractLocales')
      .mockImplementationOnce(() => ['source-locale', []])
    const wrapper = mount(<LocalePicker />)

    expect(wrapper.find(TargetLocales).prop('sourceLocale')).toBe(
      'source-locale'
    )
  })

  it('should pass extracted target locales to target locale display', () => {
    jest
      .spyOn(propsExtractor, 'extractLocales')
      .mockImplementationOnce(() => ['', ['target-1', 'target-2']])
    const wrapper = mount(<LocalePicker />)

    expect(wrapper.find(TargetLocales).prop('targetLocales')).toStrictEqual([
      'target-1',
      'target-2'
    ])
  })
})
