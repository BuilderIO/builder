import { Builder } from '@builder.io/sdk'
import { SimplePage } from './components/simple-page'

Builder.register('editor.settings', {
  hideStyleTab: true,
  hideMainTabs: true,
  hideDataTab: true,
  hideAnimateTab: true,
  hideTargeting: true,
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
  icon:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F20c994a85a6741b5be6a6ead7316c8d9',
  component: SimplePage,
})
