/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { CustomEditorProps } from '../interfaces/custom-editor'
import { useObserver } from 'mobx-react'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { Create } from '@material-ui/icons'
import { Row } from './row'

/**
 * Custom editor to link a page to a data model entry
 */
export function PageLink(props: CustomEditorProps<string>) {
  return useObserver(() => (
    <Row css={{ marginTop: 5, marginBottom: 10 }}>
      {/* Could be fancy and show the content screenshot, etc here */}
      <Button
        disabled={!props.value}
        css={{ width: 250 }}
        onClick={() => {
          props.context.location.go(`/content/${props.value}`)
        }}
        variant="outlined"
        color="primary"
      >
        Edit page
      </Button>
      {/* Has developer permissions they can edit the page reference,
      otherwise other users just see the edit button */}
      {props.context.user.can('editCode') && (
        <Tooltip title="Only developers and admins can edit this">
          <IconButton
            css={{ padding: 5, marginLeft: 5 }}
            onClick={async () => {
              // Ideally, show a contentn picker using the API to list
              // choices
              const newChoice = await props.context.dialogs.prompt({
                defaultValue: props.value,
                title: 'Choose a content ID',
              })
              if (newChoice) {
                props.onChange(newChoice)
              }
            }}
          >
            <Create css={{ fontSize: 18, color: '#bbb' }} />
          </IconButton>
        </Tooltip>
      )}
    </Row>
  ))
}
