/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'

export function SetShopifyKeysMessage() {
  return (
    <div
      css={{
        padding: 40
      }}
    >
      You have not entered your shopify keys! Go to your{' '}
      <a target="_blank" href="/account/organization">
        settings
      </a>{' '}
      page, find @builder.io/shopify in the list, and set your API and secret
      keys to use this plugin
    </div>
  )
}
