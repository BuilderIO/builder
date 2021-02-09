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
import { CreateCampaign } from './create-campaign'

interface AppTabProps {
  context: ApplicationContext
}

/**
 * Builder app-wide page to list and create campaigns
 */
export function CampaignsPage(props: AppTabProps) {
  const state = useLocalStore(() => ({
    campaigns: [] as BuilderContent[],
    teams: [] as BuilderContent[],
    fetchingCampaigns: false,
    fetchingTeams: false,
    get loading() {
      return state.fetchingCampaigns || state.fetchingTeams
    },
    get campaignsModel() {
      return props.context.models.result.find(
        (item: any) => item.name === 'campaign'
      )
    },
    get teamsThatUserIsAdmin() {
      return state.teams.filter((item) =>
        (item.data!.admins || []).includes(props.context.user.id)
      )
    },
    get teamsForUser() {
      // Get teams where the current user is either a member or an admin
      return state.teams.filter((item) =>
        [...(item.data!.members || []), ...(item.data!.admins || [])].includes(
          props.context.user.id
        )
      )
    },
    hasAccessToCampaign(campaign: BuilderContent) {
      // Global admins or developers have access everywhere
      if (
        (props.context.user.can('admin') ||
          props.context.user.can('editCode')) &&
        // For debugging, if ?ignoreAdmins=true is in the URL show what a user would see
        // not as an admin
        !location.search.includes('ignoreAdmins=true')
      ) {
        return true
      }
      const teamIdsForCampaign = (campaign.data!.teams || []).map(
        (item: any) => item.team.id
      )

      return state.teamsForUser.some((team) =>
        teamIdsForCampaign.includes(team.id)
      )
    },
    async getTeams() {
      state.fetchingTeams = true
      const { user } = props.context
      const teams = await fetch(
        // See https://www.builder.io/c/docs/query-api
        `https://cdn.builder.io/api/v2/content/team?apiKey=${user.apiKey}&query.published.$ne=archived&limit=50&cachebust=true`,
        {
          headers: user.authHeaders,
        }
      ).then((res) => res.json())
      state.teams = Array.isArray(teams.results) ? teams.results : []
      state.fetchingTeams = false
    },
    async getCampaigns() {
      state.fetchingCampaigns = true
      const { user } = props.context
      const campaigns = await fetch(
        // See https://www.builder.io/c/docs/query-api
        `https://cdn.builder.io/api/v2/content/campaign?apiKey=${user.apiKey}&query.published.$ne=archived&limit=50&cachebust=true`,
        {
          headers: user.authHeaders,
        }
      ).then((res) => res.json())
      state.campaigns = Array.isArray(campaigns.results)
        ? campaigns.results
        : []
      state.fetchingCampaigns = false
    },
    async createCampaign() {
      const close = await props.context.globalState.openDialog(
        <CreateCampaign context={props.context} onComplete={() => close()} />
      )
    },
  }))

  useEffect(() => {
    state.getCampaigns()
    state.getTeams()
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
          <Typography css={{ fontSize: 32 }}>Campaigns</Typography>
          <Button
            css={{ marginLeft: 'auto' }}
            color="primary"
            variant="contained"
            onClick={state.createCampaign}
          >
            New Campaign
          </Button>
        </Row>

        {!state.campaigns.length && state.fetchingCampaigns ? (
          <CircularProgress disableShrink css={{ margin: '50px auto' }} />
        ) : !state.campaigns.length ? (
          <Typography
            variant="caption"
            css={{ margin: 50, fontSize: 16, textAlign: 'center' }}
          >
            You have no campaigns, try creating one above
          </Typography>
        ) : (
          <Paper>
            <List>
              {state.campaigns?.map((item) => (
                <ListItem
                  disabled={!state.hasAccessToCampaign(item)}
                  key={item.id}
                  button
                  onClick={() => {
                    props.context.location.go(`/content/${item.id}`)
                  }}
                >
                  <ListItemText
                    primary={
                      item.name || (
                        <span css={{ opacity: 0.5 }}>(Unnamed campaign)</span>
                      )
                    }
                    secondary={item.published}
                  />
                  {!state.hasAccessToCampaign(item) && (
                    <ListItemSecondaryAction>
                      <Button
                        color="primary"
                        onClick={() => {
                          // TODO :)
                        }}
                      >
                        Request access
                      </Button>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </Stack>
  ))
}
