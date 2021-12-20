/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Button, Divider, IconButton, Switch, Tooltip } from '@material-ui/core'
import {
  ArrowBack,
  LaptopMac,
  PhoneIphone,
  Redo,
  TabletMac,
  Undo,
} from '@material-ui/icons'
import { useObserver } from 'mobx-react'
import React from 'react'
import { ApplicationContext } from '../interfaces/application-context'
import { settings } from '../state/settings'

const resizeButtonStyles: any = {
  height: 38,
  width: 38,
  margin: '0 4px',
  position: 'relative',
  padding: 0,
}

const context: ApplicationContext = require('@builder.io/app-context').default

// Foobar example header component
export const Header = () => {
  return useObserver(() => {
    const isContentPage = context.location.pathname.startsWith('/content/')

    return (
      <React.Fragment>
        {!settings.advancedMode && (
          <style>{`
          .responsive-style-changes-warning { display: none }
          .content-editor-tabs { display: none }
          button[type=button][class*=MuiButtonBase][class*=InsertEditor] { display: none }
        `}</style>
        )}
        <style>{`
          .custom-fields-buttons { display: none }
          .page-main-inner { height: 100vh; overflow: clip; }
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
              <div css={{ display: 'flex', alignItems: 'center', padding: 10 }}>
                <div
                  role="button"
                  onClick={() => {
                    context.location.go('/apps/simple')
                  }}
                  css={{ fontSize: 20 }}
                >
                  <ArrowBack css={{ verticalAlign: 'middle' }} />
                </div>
                <div css={{ marginLeft: 20 }}>
                  Edit {context.editor.content?.model?.name}
                </div>

                <div
                  css={{
                    display: 'flex',
                    flexGrow: 1,
                  }}
                >
                  <div css={{ display: 'flex', margin: '0 auto' }}>
                    <IconButton
                      css={resizeButtonStyles}
                      onClick={() => {
                        context.editor.artboardSize.width = 2000
                      }}
                    >
                      {/* TODO: highlight relevant color */}
                      <LaptopMac css={{ color: '#c7c7c7' }} />
                    </IconButton>
                    <IconButton
                      css={resizeButtonStyles}
                      onClick={() => {
                        context.editor.artboardSize.width = 642
                      }}
                    >
                      <TabletMac css={{ color: '#c7c7c7' }} />
                    </IconButton>
                    <IconButton
                      css={resizeButtonStyles}
                      onClick={() => {
                        context.editor.artboardSize.width = 321
                      }}
                    >
                      <PhoneIphone css={{ color: '#c7c7c7' }} />
                    </IconButton>
                  </div>

                  <div
                    css={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Tooltip title="Toggle advanced mode">
                      <div
                        css={{
                          height: '100%',
                          position: 'relative',
                          marginRight: 10,
                        }}
                      >
                        <Switch
                          css={{
                            position: 'absolute',
                            right: 0,
                            top: -5,
                          }}
                          checked={settings.advancedMode}
                          onChange={(event, checked) =>
                            (settings.advancedMode = checked)
                          }
                          color="primary"
                        />
                      </div>
                    </Tooltip>

                    <Tooltip title="Undo">
                      <div>
                        <IconButton
                          css={{ padding: 5 }}
                          onClick={() => context.editor.undo()}
                          disabled={!context.editor.canUndo}
                        >
                          <Undo
                            css={{
                              color: '#999',
                              opacity: context.editor.canUndo ? 1 : 0.5,
                            }}
                          />
                        </IconButton>
                      </div>
                    </Tooltip>
                    <Tooltip title="Redo">
                      <div>
                        <IconButton
                          css={{ padding: 5 }}
                          onClick={() => context.editor.redo()}
                          disabled={!context.editor.canRedo}
                        >
                          <Redo
                            css={{
                              color: '#999',
                              opacity: context.editor.canRedo ? 1 : 0.5,
                            }}
                          />
                        </IconButton>
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <Button
                  css={{ margin: '0 20px' }}
                  variant="raised"
                  color="primary"
                  onClick={async () => {
                    context.globalState.showGlobalBlockingLoading()
                    await context.content.update({
                      ...context.editor.content,
                      published: 'published',
                    })
                    // send context.editor.content to your backend // current model // current user
                    context.globalState.hideGlobalBlockingLoading()
                  }}
                >
                  Publish
                </Button>
              </div>
            </div>
          </div>
        )}
        <Divider />
      </React.Fragment>
    )
  })
}
