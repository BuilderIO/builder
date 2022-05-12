/**
 * Specify builder editor settings like what components to show when
 */

import { Builder, builder } from '@builder.io/react'

// Import any Builder components we want to use
import '../blocks/header/spacer/spacer.builder'
import '../blocks/header/nav-links/nav-links.builder'
import '../blocks/header/logo/logo.builder'
import '../blocks/header/search-bar/search-bar.builder'
import '../blocks/header/cart/cart.builder'
import '../blocks/page/hero/hero.builder'
import '../blocks/page/double-columns/double-columns.builder'
import '../blocks/page/dynamic-columns/dynamic-columns.builder'

builder.init(process.env.BUILDER_PUBLIC_KEY!)

Builder.register('editor.settings', { customInsertMenu: true })

if (Builder.isBrowser) {
  if (builder.editingModel === 'header') {
    // Header specific components
    Builder.register('insertMenu', {
      name: 'Header blocks',
      items: [
        { name: 'Logo' },
        { name: 'Nav Links' },
        { name: 'Search' },
        { name: 'Cart' },
        { name: 'Spacer' },
      ],
    })
  } else {
    // Page specific components
    Builder.register('insertMenu', {
      name: 'Page blocks',
      items: [
        { name: 'Hero' },
        { name: 'Double Columns' },
        { name: 'Triple Columns' },
        { name: 'Dynamic Columns' },
      ],
    })
  }
}
