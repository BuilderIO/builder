import { Builder } from '@builder.io/sdk'
import { settings } from './state/settings'
import { reaction } from 'mobx'
import { Header } from './components/editor-header'
import { SimplePage } from './components/simple-page'
import { ApplicationContext } from './interfaces/application-context'

const context: ApplicationContext = require('@builder.io/app-context').default
const pluginId = 'my-white-labeling-plugin'
Builder.register('plugin', {
  // should match npm id if loading from npm
  id: pluginId,
})

reaction(
  () => settings.advancedMode,
  (advancedMode) => {
    if (advancedMode) {
      Builder.register('editor.settings', {
        hideToolbar: true,
        hideHeatMap: false,
        hideMainTabs: false,
        hideFormComponents: false,
        hideDataTab: false,
        hideStyleTab: false,
        hideLayersTab: false,
        hideAnimateTab: false,
        hideABTab: false,
        hidePageUrlEditor: false,
        componentsOnlyMode: false,
        hideTemplates: true,
        hideSymbols: true,
        hideOptionsTab: false,
      })
    } else {
      Builder.register('editor.settings', {
        hideToolbar: true,
        hideHeatMap: true,
        hideMainTabs: true,
        hideFormComponents: true,
        hideDataTab: true,
        hideStyleTab: true,
        hideLayersTab: true,
        hideAnimateTab: true,
        hideABTab: true,
        hidePageUrlEditor: true,
        componentsOnlyMode: true,
        hideTemplates: true,
        hideSymbols: true,
        hideOptionsTab: true,
      })
    }
  },
  {
    fireImmediately: true,
  }
)

Builder.register('editor.header', {
  component: Header,
})

Builder.register('editor.previewToolbar', {
  component: () => null,
})

// Register some app settings
Builder.register('appSettings', {
  settings: {
    hideDefaultTabs: true,
    hideLeftSidebar: true,
    defaultRoute: '/apps/simple',
  },
  theme: {
    colors: {
      primary: 'rgb(16, 47, 77)',
      secondary: 'rgb(16, 47, 77)',
    },
    // Provide any theme configuration for material UI v3
    // https://v3.material-ui.com/customization/themes/#theme-configuration-variables
    mui: {
      typography: {
        fontFamily:
          'Matter, proxima-nova, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
      },
    },
  },
})

// Register a tab in the app called "campaigns" with a custom UI for listing and creating campaigns
Builder.register('appTab', {
  name: 'Simple',
  path: 'simple',
  component: SimplePage,
})

Builder.register('app.onLoad', () => {
  // only on first load take users to the plugin page
  context.location.go('/apps/simple')
})

top?.postMessage(
  {
    type: 'plugin.loaded',
  },
  '*'
)
