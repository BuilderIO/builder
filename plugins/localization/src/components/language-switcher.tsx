import React, { useState } from 'react'
import { ApplicationContext } from '../interfaces/application-context'
import { useEffect } from 'react'
import Gear from '../icons/gear'
const context: ApplicationContext = require('@builder.io/app-context').default
const pluginId = 'language-switcher'

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
    const currentUser = await context.user.getUser(context.user.id)
    //@ts-ignore
    const currentOrg = await context.user.organization
    //@ts-ignore
    const pluginSettings = await (await currentOrg.value.settings.plugins).get(
      pluginId
    )
    console.log({ pluginSettings })
    const localesMap = await pluginSettings?.get('locales')
    const locales = localesMap.map((l: any) => ({
      name: l.get('localeName'),
      code: l.get('localeCode')
    }))
    setLocales(locales)
  }

  useEffect(() => {
    onLoad()
  }, [])

  return (
    <React.Fragment>
      {/*@ts-ignore*/}
      <div
        onClick={() => window?.languageSettingsTrigger()}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '5px'
        }}
      >
        <Gear />
      </div>
      <select
        onChange={v => {
          if (
            context.designerState.editingIframeRef &&
            context.designerState.editingContentModel?.url
          ) {
            const { origin, search } = new URL(
              context.designerState.editingIframeRef.src
            )
            if (!!v.target.dataset.default && v.target.value === v.target.dataset.default) {
              context.designerState.editingIframeRef.src =
                origin + context.designerState.editingContentModel?.url + search
            } else {
              context.designerState.editingIframeRef.src =
                origin +
                '/' +
                v.target.value +
                context.designerState.editingContentModel?.url +
                search
            }
          }
        }}
        data-default={locales && locales[0]?locales[0]?.code:undefined}
      >
        {locales?.map((locale, index) => (
          <option key={index} value={locale.code}>{locale.name}</option>
        ))}
      </select>
    </React.Fragment>
  )
}

export default LangugeSwitcher
