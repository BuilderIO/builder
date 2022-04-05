import { Builder } from '@builder.io/sdk'
import { Header } from './components/editor-header'
import { SimplePage } from './components/simple-page'

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
      primary: 'rgb(220 130 86)',
    },
    // Provide any theme configuration for material UI v3
    // https://v3.material-ui.com/customization/themes/#theme-configuration-variables
    mui: {
      typography: {
        fontFamily: 'Arial',
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
