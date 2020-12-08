/** @jsx jsx */
import { BuilderContent } from '@builder.io/sdk'
import { jsx } from '@emotion/core'
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { RemoveCircleOutline } from '@material-ui/icons'
import { useLocalStore, useObserver } from 'mobx-react'
import React, { useState } from 'react'
import {
  ApplicationContext,
  BuilderUser,
} from '../interfaces/application-context'
import { CustomEditorProps } from '../interfaces/custom-editor'
import { Stack } from './stack'

const getUserHook = (context: ApplicationContext, id: string) => {
  const [user, setUser] = useState<BuilderUser | null>(null)
  if (user && user.id === id) {
    return user
  }

  // TODO: cancel pending if re-rendering, esp if user ID changed
  context.user.getUser(id).then((user) => {
    if (!user || id === user.id) {
      setUser(user)
    }
  })

  return null
}
const listUsersHook = (context: ApplicationContext) => {
  const [users, setUsers] = useState<BuilderUser[] | null>(null)

  if (users) {
    return users
  }

  // TODO: cancel pending if re-rendering, esp if user ID changed
  context.user.listUsers().then((users) => {
    setUsers(users)
  })

  return null
}

export function UserPicker(props: {
  context: ApplicationContext
  value?: string
  onChoose(id?: string): void
  omit?: string[]
  className?: string
}) {
  const { context, value, onChoose, omit } = props
  // Don't list already selected users
  const users = listUsersHook(context)?.filter(
    (item) => !omit?.includes(item.id)
  )

  return useObserver(() => {
    return (
      <Stack className={props.className}>
        <Typography css={{ fontSize: 22, textAlign: 'center' }}>
          Choose a user
        </Typography>
        {!users && <CircularProgress css={{ margin: '50px auto' }} />}
        {users && (
          <React.Fragment>
            {users.length ? (
              <List>
                {users.map((item) => (
                  <ListItem
                    button
                    selected={item.id === value}
                    key={item.id}
                    onClick={() => {
                      onChoose?.(item.id)
                    }}
                  >
                    <ListItemText primary={item.email} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography
                variant="caption"
                css={{ textAlign: 'center', padding: 20 }}
              >
                No results
              </Typography>
            )}
          </React.Fragment>
        )}
      </Stack>
    )
  })
}

/**
 * Custom field type editor to add additional pages to a campaign
 */
export function UsersList(props: CustomEditorProps<string[]>) {
  const value = props.value || []

  const state = useLocalStore(() => ({
    entry: null as null | BuilderContent,
    loadingEntry: false,
    async addUser() {
      const close = await props.context.globalState.openDialog(
        <UserPicker
          omit={value}
          context={props.context}
          css={{
            width: 500,
            padding: 30,
          }}
          onChoose={(id) => {
            if (id) {
              props.onChange([...value, id])
            }
            close()
          }}
        />
      )
    },
  }))

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
                <UserPreviewCell
                  userId={item}
                  key={item}
                  onRemove={() => {
                    props.onChange(
                      value.filter((valueItem) => valueItem !== item)
                    )
                  }}
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
        onClick={state.addUser}
      >
        Add user
      </Button>
    </Stack>
  ))
}

function UserPreviewCell(props: {
  userId: string
  context: ApplicationContext
  onRemove?: () => void
}) {
  const { userId, context, onRemove } = props
  const user = getUserHook(context, userId)

  return useObserver(() => {
    // TODO: add abillity to remove users here too (delete button with ListItemAction)
    return (
      <ListItem
        css={{
          '&:hover .remove-button': {
            opacity: 1,
          },
        }}
      >
        {userId && !user && <CircularProgress size={20} disableShrink />}
        {userId && user && (
          <React.Fragment>
            <ListItemText primary={user.email} />

            {onRemove && (
              <ListItemSecondaryAction>
                <Tooltip title="Remove user">
                  <IconButton
                    className="remove-button"
                    css={{ padding: 5, opacity: 0, transition: 'opacity 0.2s' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove()
                    }}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            )}
          </React.Fragment>
        )}
      </ListItem>
    )
  })
}
