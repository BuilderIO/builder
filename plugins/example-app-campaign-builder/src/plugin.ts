import { Builder } from '@builder.io/sdk'
import { CampaignsPage } from './components/campaigns-page'
import { PageLink } from './components/page-link'
import { AdditionalPages } from './components/additional-pages'
import { UsersList } from './components/users-list'
import { reaction } from 'mobx'
import { Header } from './components/header'
import { ApplicationContext } from './interfaces/application-context'
import { InsertMenu } from './components/insert-menu'
import { PreviewToolbar } from './components/preview-toolbar'

// using require(..) here makes typescript happy that this module is
// not actually in node_modules
const context: ApplicationContext = require('@builder.io/app-context').default

// Add buttons to the top toolbar when editing content
Builder.register('editor.toolbarButton', {
  component: () => 'Hello!',
})

// Add a left tab to the editing content page
Builder.register('editor.editTab', {
  name: 'Hello',
  component: () => 'Hello!',
})

// Placeholder function for this
async function isUserAllowedAdvancedEditing(userId: string) {
  return true
}

const defaultEditorSettings = {
  hideToolbar: true,
  hideHeatMap: true,
  hideMainTabs: true,
  // containerStyles: {
  //   maxWidth: 1400,
  //   boxShadow: '3px 3px 20px rgba(0, 0, 0, 0.15)'
  // }
}

reaction(
  () => {
    // some observale thing, can be your own observable code too
    return context.user.id
  },
  async (userId) => {
    if (await isUserAllowedAdvancedEditing(userId)) {
      Builder.register('editor.settings', {
        ...defaultEditorSettings,
        hideStyleTab: true,
        hideDataTab: true,
      })
    } else {
      Builder.register('editor.settings', {
        ...defaultEditorSettings,
        hideStyleTab: false,
        hideDataTab: false,
      })
    }
  },
  { fireImmediately: true }
)

// Add a right tab to the editing content page
Builder.register('editor.mainTab', {
  name: 'Custom right tab',
  component: () => 'Hello!',
})

// Add a header to the content editor
Builder.register('editor.header', {
  component: Header,
})

// Add a header to the content editor
Builder.register('editor.insertMenu', {
  component: InsertMenu,
})

Builder.register('editor.previewToolbar', {
  component: PreviewToolbar,
})

// Register a custom 'pageLink' field type with a special editor
Builder.registerEditor({
  name: 'pageLink',
  component: PageLink,
})

// Register a custom 'additionalPages' field type with a special editor
Builder.registerEditor({
  name: 'additionalPages',
  component: AdditionalPages,
})

// Register a custom 'uesrsList' field type allows us to pick Builder users
// for teams
Builder.registerEditor({
  name: 'usersList',
  component: UsersList,
})

// Register some app settings
Builder.register('appSettings', {
  settings: {
    hideDefaultTabs: true,
    hideLeftSidebar: true,
    defaultRoute: '/apps/campaigns',
  },
  theme: {
    logo:
      'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4aab65cdfa6644e5b6c396429956d513',
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
  name: 'Campaigns',
  path: 'campaigns',
  icon:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F20c994a85a6741b5be6a6ead7316c8d9',
  component: CampaignsPage,
})
