/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Button, MenuItem, TextField, Typography } from '@material-ui/core'
import { useLocalStore, useObserver } from 'mobx-react'
import { pageTemplates } from '../constants/page-templates'
import { ApplicationContext } from '../interfaces/application-context'
import { Stack } from './stack'

type PageType = 'page type a' | 'page type b'
const pageTypes: PageType[] = ['page type a', 'page type b']

/**
 * Modal for creating a page that offers high level options and generates
 * defaults
 */
export function CreatePage(props: {
  context: ApplicationContext
  onComplete: () => void
}) {
  const state = useLocalStore(() => ({
    pageTypeChoice: pageTypes[0],
    pageName: '',
    async createPage() {
      const template = pageTemplates[state.pageTypeChoice]

      const { id } = await props.context.createContent('page', template.page)

      props.context.location.go(`/content/${id}`)
      // Create the page
      props.onComplete()
    },
    onFormSubmit(e: React.FormEvent) {
      e.preventDefault()
      this.createPage()
    },
  }))

  const spacing = 30

  return useObserver(() => (
    <Stack
      css={{
        width: 500,
        padding: spacing,
        maxWidth: '95vh',
        overflow: 'auto',
      }}
    >
      <Typography css={{ fontSize: 22, textAlign: 'center' }}>
        Create page
      </Typography>
      <form onSubmit={state.onFormSubmit}>
        <TextField
          fullWidth
          css={{ marginTop: spacing }}
          placeholder="New page"
          value={state.pageName}
          autoFocus
          onChange={(e) => (state.pageName = e.target.value)}
          label="Give your page a name"
        />
        <TextField
          css={{ marginTop: spacing }}
          fullWidth
          value={state.pageTypeChoice}
          onChange={(e) => (state.pageTypeChoice = e.target.value as PageType)}
          select
          label="Choose a page type"
        >
          {pageTypes.map((pageType) => (
            <MenuItem value={pageType} key={pageType}>
              {pageType}
            </MenuItem>
          ))}
        </TextField>
        <Button
          type="submit"
          css={{ marginTop: spacing }}
          color="primary"
          fullWidth
          variant="contained"
        >
          Choose
        </Button>
      </form>
    </Stack>
  ))
}
