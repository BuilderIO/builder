import appState, { Content, ContentModel } from '@builder.io/app-context'
import { Builder, BuilderContent, Input, builder } from '@builder.io/sdk'
import LangugeSwitcher from './components/language-switcher'
import { pluginId } from './constants'
import { ApplicationContext } from './interfaces/application-context'
declare global {
  interface Window {
    languageSettingsTrigger: () => Promise<void>
  }
}

interface Model {
  name: string;
  hideFromUI?: boolean;
  kind: 'data' | 'page' | 'component' | 'function';
}
interface IAppState {
  user: {
    organization: {
      value: {
        settings: {
          plugins: {
            get: (model: string) => any,
            set: (partal: Record<string, any>) => void,
          },
        },
      },
    },
  },
  models: {
    result: Model[]
  },
}

const context: ApplicationContext & IAppState = require('@builder.io/app-context').default

const localization: Model = {
  name: 'localization',
  kind: 'data',
  hideFromUI: false,
}
// Add buttons to the top toolbar when editing content
Builder.register('editor.toolbarButton', {
  component: LangugeSwitcher,
})

interface OnSaveActions {
  updateSettings(partal: Record<string, any>): Promise<void>;
  addModel(model: Model): Promise<void>;
}



Builder.register('plugin', {
  id: pluginId,
  name: 'wecre8Websites Localization',
  settings: [
    {
      name: 'locales',
      type: 'list',
      subFields: [
        {
          name: 'localeCode',
          type: 'string',
        },
        {
          name: 'localeName',
          type: 'string',
        },
      ]
    }

  ],
  ctaText: 'Save',

  async onSave(actions: OnSaveActions) {
    const currentOrg = context.user.organization;
    const pluginSettings = currentOrg.value.settings.plugins.get(pluginId);
    const localesMap = await pluginSettings?.get('locales')
    const locales = localesMap.map((l: any) => ({
      localeName: l.get('localeName'),
      localeCode: l.get('localeCode')
    }))
    const existingModel: any = context.models.result.find((m: Model) => m.name === localization.name)
    if (!existingModel)
      actions.addModel(localization);
    else console.log({ existingModel });
    const activeLocales: Content = {
      name: "activeLocales",
      //modelId: "localization",
      data: {
        locales
      }
    }
    try {
      //@ts-ignore
      if (existing) {
        const updated = await context.content.update(activeLocales);
      }

    } catch (e) {
      console.log(e);
      const content = await context.createContent('localization', activeLocales)
      //@ts-ignore
      const locales = content.data.get('locales').map(l => ({ localeName: l.get('localeName'), localeCode: l.get('localeCode') }))

      console.log({ locales })
    }
    //context.content.update(activeLocales);

    //context.models.update({...existingModel,hideFromUI:false})
    //@ts-ignore
    appState.dialogs.alert('Plugin settings saved.');
  },
})

interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  const currentOrg = context.user.organization;
  const pluginSettings = currentOrg.value.settings.plugins.get(pluginId);
  const locales = pluginSettings?.get('locales');
  if (typeof locales === "string" || !locales) {
    pluginSettings.set("locales", []);
    await triggerSettingsDialog(pluginId);
  }
  window.languageSettingsTrigger = async () => await triggerSettingsDialog(pluginId)
});