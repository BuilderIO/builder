/** @jsx jsx */
import { jsx } from '@emotion/core'
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  CircularProgress,
  Typography,
  ListItemSecondaryAction,
} from '@material-ui/core'
import { useLocalStore, useObserver } from 'mobx-react'
import { BuilderContent } from '@builder.io/sdk'
import { useEffect } from 'react'
import { ApplicationContext } from '../interfaces/application-context'
import { Stack } from './stack'
import { Row } from './row'
import { CreatePage } from './create-page'

interface AppTabProps {
  context: ApplicationContext
}

/**
 * Builder app-wide page to list and create pages
 */
export function SimplePage(props: AppTabProps) {
  const state = useLocalStore(() => ({
    pages: [] as BuilderContent[],
    fetchingPages: false,
    get loading() {
      return state.fetchingPages
    },
    get pagesModel() {
      return props.context.models.result.find(
        (item: any) => item.name === 'page'
      )
    },

    async getPages() {
      state.fetchingPages = true
      const { user } = props.context
      const pages = await fetch(
        // See https://www.builder.io/c/docs/query-api
        `https://cdn.builder.io/api/v2/content/page?apiKey=${user.apiKey}&query.published.$ne=archived&limit=50&cachebust=true`,
        {
          headers: user.authHeaders,
        }
      ).then((res) => res.json())
      state.pages = Array.isArray(pages.results) ? pages.results : []
      state.fetchingPages = false
    },
    async createPage() {
      const close = await props.context.globalState.openDialog(
        <CreatePage context={props.context} onComplete={() => close()} />
      )
    },
  }))

  useEffect(() => {
    state.getPages()
  }, [])

  return useObserver(() => (
    <Stack>
      <Stack
        css={{
          maxWidth: 1000,
          padding: 20,
          margin: 'auto',
          width: '100%',
        }}
      >
        <Row
          css={{
            color: '#444',
            paddingBottom: 20,
          }}
        >
          <Typography css={{ fontSize: 32 }}>Pages</Typography>
          <Button
            css={{ marginLeft: 'auto' }}
            color="primary"
            variant="contained"
            onClick={state.createPage}
          >
            New Page
          </Button>
        </Row>

        {!state.pages.length && state.fetchingPages ? (
          <CircularProgress disableShrink css={{ margin: '50px auto' }} />
        ) : !state.pages.length ? (
          <Typography
            variant="caption"
            css={{ margin: 50, fontSize: 16, textAlign: 'center' }}
          >
            You have no pages, try creating one above
          </Typography>
        ) : (
          <Paper>
            <List>
              {state.pages?.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={() => {
                    props.context.location.go(`/content/${item.id}`)
                  }}
                >
                  <ListItemText
                    primary={
                      item.name || (
                        <span css={{ opacity: 0.5 }}>(Unnamed page)</span>
                      )
                    }
                    secondary={item.published}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </Stack>
  ))
}
