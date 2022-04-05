/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Button } from '@material-ui/core'
import { useObserver } from 'mobx-react'
import React from 'react'
import { ApplicationContext } from '../interfaces/application-context'

const context: ApplicationContext = require('@builder.io/app-context').default

// Foobar example header component
export const Header = () => {
  return useObserver(() => {
    const isContentPage = context.location.pathname.startsWith('/content/')
    const editingContent = context.designerState.editingContentModel
    return (
      <React.Fragment>
        <style>{`
          .content-editor-tabs { display: none }
          button[type=button][class*=MuiButtonBase][class*=InsertEditor] { display: none }
        `}</style>
        {isContentPage && (
          <div
            css={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <div css={{ width: '100%', margin: 'auto' }}>
              <div css={{ display: 'flex', alignItems: 'center' }}>
                <div
                  onClick={() => {
                    context.location.go('/')
                  }}
                  css={{ fontSize: 20, padding: 20 }}
                >
                  Landing page
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
