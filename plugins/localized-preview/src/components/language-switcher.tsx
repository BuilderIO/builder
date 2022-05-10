import { MenuItem, Select } from '@material-ui/core'
import { Settings } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import { ExtendedApplicationContext } from '../interfaces/application-context'
import { pluginId } from '../constants'
const context: ExtendedApplicationContext =
  require('@builder.io/app-context').default

declare global {
  interface Window {
    languageSettingsTrigger: () => Promise<void>
  }
}

const LangugeSwitcher = () => {
  const [locales, setLocales] = useState<
    {
      code: string
      name: string
    }[]
  >()
  const onLoad = async () => {
    const currentOrg = context.user.organization
    const pluginSettings = currentOrg.value.settings.plugins.get(pluginId)
    const localesMap = pluginSettings?.get('locales')
    const locales = localesMap.map((l: any) => ({
      name: l.get('localeName'),
      code: l.get('localeCode'),
    }))
    setLocales(locales)
    setSelectedLocale(locales[0].code)
  }

  useEffect(() => {
    onLoad()
  }, [])

  const [selectedLocale, setSelectedLocale] = useState<string>()

  const handleLocaleChange = (code: string) => {
    if (
      context.designerState.editingIframeRef &&
      context.designerState.editingContentModel?.url
    ) {
      const { origin, search } = new URL(
        context.designerState.editingIframeRef.src
      )
      let finalUrl = ''
      if (locales?.length && code === locales[0].code) {
        finalUrl =
          origin + context.designerState.editingContentModel?.url + search
      } else {
        //! Unreliable -- Only succeeds in changing url intermittently. Also seems to save the preview path, overwriting the default
        // context.designerState.editingContentModel.previewUrl = origin + '/' + code + context.designerState.editingContentModel?.url
        finalUrl =
          origin +
          '/' +
          code +
          context.designerState.editingContentModel?.url +
          search
      }
      context.designerState.editingIframeRef.src = finalUrl
      const preview = locales?.find((locale) => locale.code === code)
      context.snackBar.show(`Previewing ${preview?.name || code}`)
    }
    setSelectedLocale(code)
  }

  return (
    <React.Fragment>
      <div
        onClick={() => window?.languageSettingsTrigger()}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '5px',
        }}
      >
        <Settings color="action" />
      </div>
      <Select
        defaultValue={selectedLocale}
        value={selectedLocale}
        onChange={(v) => {
          handleLocaleChange(v.target.value as string)
        }}
      >
        {locales?.map((locale) => (
          <MenuItem value={locale.code}>{locale.name}</MenuItem>
        ))}
      </Select>
    </React.Fragment>
  )
}

export default LangugeSwitcher
