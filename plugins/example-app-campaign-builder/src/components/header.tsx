/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { useObserver } from 'mobx-react'
import { ApplicationContext } from '../interfaces/application-context'
import { Button, Tabs, Tab } from '@material-ui/core'

const context: ApplicationContext = require('@builder.io/app-context').default

// Foobar example header component
export const Header = () => {
  return useObserver(() => {
    const isContentPage = context.location.pathname.startsWith('/content/')
    const editingContent = context.designerState.editingContentModel
    return (
      <React.Fragment>
        {isContentPage && (
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <div css={{ maxWidth: 1400, width: '100%', margin: 'auto' }}>
              <div css={{ display: 'flex', alignItems: 'center' }}>
                <div
                  onClick={() => {
                    context.location.go('/')
                  }}
                  css={{ fontSize: 20, padding: 20 }}
                >
                  {/* This of course can be dynamic campaign name */}
                  Campaign name
                </div>
                <Button
                  css={{ marginLeft: 'auto', marginRight: 20 }}
                  variant="raised"
                  color="secondary"
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  })
}
