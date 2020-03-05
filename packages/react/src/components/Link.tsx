import React from 'react'
import { BuilderStoreContext } from '../store/builder-store'

export const Link: React.SFC<React.AnchorHTMLAttributes<
  HTMLAnchorElement
>> = props => (
  <BuilderStoreContext.Consumer>
    {context => {
      if (context.renderLink) {
        return context.renderLink(props)
      }
      return <a {...props} />
    }}
  </BuilderStoreContext.Consumer>
)
