/** @jsx jsx */
import { jsx } from '@emotion/core'
import React, { useEffect } from 'react'
import { CustomEditorProps } from '../interfaces/custom-editor'
import { useObserver, useLocalStore } from 'mobx-react'
import { BuilderContent } from '@builder.io/sdk'
import {
  Button,
  List,
  CircularProgress,
  ListItemText,
  ListItem,
  ListItemAvatar,
  Avatar,
  Paper,
  Divider,
} from '@material-ui/core'
import { Stack } from './stack'
import { ApplicationContext } from '../interfaces/application-context'

/**
 * Custom field type editor to add additional pages to a campaign
 */
export function AdditionalPages(props: CustomEditorProps<string[]>) {
  const value = props.value || []

  const state = useLocalStore(() => ({
    entry: null as null | BuilderContent,
    loadingEntry: false,
    async getEntry() {
      const id = props.value
      if (!id) {
        this.entry = null
      } else {
        this.loadingEntry = true
        // Fetch
      }
    },
    async addPage() {
      // UPDATE ME: create page using the props.context.createContent similar to how the campaigns are created
      // over in ./create-campaign.tsx
      // and then save the ID, e.g. props.onChange([...value, theNewId])
      await props.context.dialogs.alert('TODO :)')
    },
  }))

  // When the value changes (the contnet ID), fetch
  // additional content info
  useEffect(() => {
    state.getEntry()
  }, [props.value])

  return useObserver(() => (
    <Stack
      css={{
        padding: '10px 0',
      }}
    >
      {Boolean(value.length) && (
        <div
          css={{
            backgroundColor: '#f8f8f8',
            margin: '0 -30px',
          }}
        >
          <Divider />
          <Paper css={{ margin: '20px 30px' }} elevation={1}>
            <List dense>
              {value.map((item) => (
                <ContentPreviewCell
                  contentId={item}
                  key={item}
                  context={props.context}
                />
              ))}
            </List>
          </Paper>
          <Divider />
        </div>
      )}
      <Button
        color="primary"
        variant="outlined"
        css={{
          width: 250,
          margin: '15px 0 5px',
        }}
        onClick={state.addPage}
      >
        Add page
      </Button>
    </Stack>
  ))
}

function ContentPreviewCell(props: {
  contentId: string
  context: ApplicationContext
}) {
  return useObserver(() => {
    // Content cache let's us fetch data and rerender automatically once fetched, without over fetching
    // This needs to be within useObserver so the changes are observed
    const contentCache = props.context.httpCache.get(
      // When authenticated you can skip the model name by using `_any` in it's place to find any content
      // by ID
      // See https://www.builder.io/c/docs/query-api
      `https://cdn.builder.io/api/v2/content/_any/${props.contentId}?apiKey=${props.context.user.apiKey}&fields=name,id,screenshot,published`,
      { headers: props.context.user.authHeaders }
    )

    const content = contentCache.value
    // TODO: add abillity to remove the pages too (in the meantime archiving from the page editor should be ok)
    return (
      <ListItem
        button
        onClick={() => open(`/content/${props.contentId}`, '_blank')}
      >
        {contentCache.loading && <CircularProgress size={20} disableShrink />}
        {content && (
          <React.Fragment>
            {content.screenshot && (
              <ListItemAvatar>
                <Avatar
                  imgProps={{
                    style: {
                      objectPosition: 'top',
                    },
                  }}
                  css={{
                    borderRadius: 4,
                    marginLeft: -11,
                    height: 36,
                    marginTop: -3,
                    marginBottom: -3,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                  src={content.screenshot}
                />
              </ListItemAvatar>
            )}
            <ListItemText
              primary={content.name}
              secondary={content.published}
            />
          </React.Fragment>
        )}
      </ListItem>
    )
  })
}
