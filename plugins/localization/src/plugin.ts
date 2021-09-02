import appState, { Content } from '@builder.io/app-context'
import { Builder } from '@builder.io/sdk'
import LangugeSwitcher from './components/language-switcher'
import { pluginId } from './constants'
import { ExtendedApplicationContext } from './interfaces/application-context'
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
  models: {
    result: Model[]
  },
}

const context: ExtendedApplicationContext & IAppState = require('@builder.io/app-context').default

const localization: Model = {
  name: 'localization',
  kind: 'data',
  hideFromUI: true,
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
  name: 'Localized Preview',
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
    let existingModel: any = context.models.result.find((m: Model) => m.name === localization.name)
    console.log({existingModel})
    if (!existingModel) {
      await actions.addModel(localization);
      let existingModel: any = context.models.result.find((m: Model) => m.name === localization.name)
      existingModel = true;
    }
    const activeLocales: Content = {
      name: "activeLocales",
      //modelId: "localization",
      data: {
        locales
      }
    }
    try {
      if (existingModel) {
        await context.content.update(activeLocales);
        location.reload();
      }
    } catch (e) {
      console.error(e.message);
      try {
        await context.createContent('localization', activeLocales)
        location.reload();
      } catch(e) {
        console.error(e.message);
      }
    }
    //! @Aziz Type error: Property 'dialogs' does not exist on typedef
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