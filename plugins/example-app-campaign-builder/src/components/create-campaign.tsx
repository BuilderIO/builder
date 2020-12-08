/** @jsx jsx */
import { jsx } from '@emotion/core'
import { useLocalStore, useObserver } from 'mobx-react'
import { ApplicationContext } from '../interfaces/application-context'
import { Stack } from './stack'
import { Typography, TextField, Button, MenuItem } from '@material-ui/core'
import { campaignTemplates } from '../constants/campaign-templates'
import { BuilderContent } from '@builder.io/sdk'

type CampaignType = 'campaign type a' | 'campaign type b'
const campaignTypes: CampaignType[] = ['campaign type a', 'campaign type b']

/**
 * Modal for creating a campaign that offers high level options and generates
 * defaults
 */
export function CreateCampaign(props: {
  context: ApplicationContext
  onComplete: () => void
}) {
  const state = useLocalStore(() => ({
    campaignTypeChoice: campaignTypes[0],
    campaignName: '',
    async createCampaign() {
      const template = campaignTemplates[state.campaignTypeChoice]

      const promises: Promise<any>[] = []

      const campaign: BuilderContent = {
        name: state.campaignName,
        data: {
          additionalPages: [],
        },
      }

      // Create the page entries and link them to our data model
      promises.push(
        props.context
          .createContent('page', template.splashPage)
          .then(({ id }) => {
            campaign.data!.splashPage = id
          })
      )
      promises.push(
        props.context
          .createContent('page', template.expiredPage)
          .then(({ id }) => {
            campaign.data!.expiredPage = id
          })
      )
      promises.push(
        props.context
          .createContent('page', template.mainPage)
          .then(({ id }) => {
            campaign.data!.mainPage = id
          })
      )

      for (const page of template.additionalPages) {
        promises.push(
          props.context.createContent('page', page).then(({ id }) => {
            campaign.data!.additionalPages.push(id)
          })
        )
      }

      await Promise.all(promises)

      const { id } = await props.context.createContent('campaign', campaign)

      props.context.location.go(`/content/${id}`)

      // Create the campaign
      props.onComplete()
    },
    onFormSubmit(e: React.FormEvent) {
      e.preventDefault()
      this.createCampaign()
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
        Create campaign
      </Typography>
      <form onSubmit={state.onFormSubmit}>
        <TextField
          fullWidth
          css={{ marginTop: spacing }}
          placeholder="New campaign"
          value={state.campaignName}
          autoFocus
          onChange={(e) => (state.campaignName = e.target.value)}
          label="Give your campaign a name"
        />
        <TextField
          css={{ marginTop: spacing }}
          fullWidth
          value={state.campaignTypeChoice}
          onChange={(e) =>
            (state.campaignTypeChoice = e.target.value as CampaignType)
          }
          select
          label="Choose a campaign type"
        >
          {campaignTypes.map((campaignType) => (
            <MenuItem value={campaignType} key={campaignType}>
              {campaignType}
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
