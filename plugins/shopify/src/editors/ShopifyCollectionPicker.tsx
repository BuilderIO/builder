/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Builder } from '@builder.io/react'
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@material-ui/core'
import { Create, Search } from '@material-ui/icons'
import { computed, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { SafeComponent } from '../components/safe-component'
import { CustomReactEditorProps } from '../interfaces/custom-react-editor-props'
import { BuilderRequest } from '../interfaces/builder-request'
import { SetShopifyKeysMessage } from '../components/set-shopify-keys-message'
import { fastClone } from '../functions/fast-clone'

type ShopifyCollection = any /* TODO */

const apiRoot = 'https://builder.io'

interface ShopifyCollectionPickerProps
  extends CustomReactEditorProps<BuilderRequest> {}

interface ShopifyCollectionPreviewCellProps {
  collection: ShopifyCollection
  button?: boolean
  selected?: boolean
  className?: string
}

@observer
export class CollectionPreviewCell extends SafeComponent<
  ShopifyCollectionPreviewCellProps
> {
  render() {
    return (
      <ListItem
        className={this.props.className}
        button={this.props.button}
        selected={this.props.selected}
      >
        {this.props.collection.image && (
          <ListItemAvatar>
            <Avatar
              css={{ borderRadius: 4 }}
              src={this.props.collection.image.src}
            />
          </ListItemAvatar>
        )}
        <ListItemText primary={this.props.collection.handle} />
      </ListItem>
    )
  }
}

@observer
export class CollectionPicker extends SafeComponent<
  CustomReactEditorProps<string>
> {
  @observable searchInputText = ''
  @observable loading = false

  @observable collections: ShopifyCollection[] = []

  async searchCollections() {
    this.loading = true
    const shopifyCustomCollectionsUrl =
      apiRoot + '/api/v1/shopify/custom_collections.json'
    const shopifySmartCollectionsUrl =
      apiRoot + '/api/v1/shopify/smart_collections.json'

    const onShopifyError = (err: any) => {
      console.error('Shopify collection search error:', err)
      this.props.context.snackBar.show(
        'Oh no! There was an error syncing your page to Shopify. Please contact us for support'
      )
    }

    // const agent =
    // TODO: cancen pending requests if any
    const customCollectionQuery = fetch(
      `${shopifyCustomCollectionsUrl}?apiKey=${
        this.props.context.user.apiKey
      }&title=${encodeURIComponent(this.searchInputText)}&limit=40`
    )
      .then(res => res.json())
      .catch(onShopifyError)

    const smartCollectionQuery = fetch(
      `${shopifySmartCollectionsUrl}?apiKey=${
        this.props.context.user.apiKey
      }&title=${encodeURIComponent(this.searchInputText)}&limit=40`
    )
      .then(res => res.json())
      .catch(onShopifyError)
    const [
      smartCollectionResponse,
      customCollectionResponse
    ] = await Promise.all([smartCollectionQuery, customCollectionQuery])

    runInAction(() => {
      let collections: any[] = []
      if (
        customCollectionResponse &&
        customCollectionResponse.custom_collections
      ) {
        collections = collections.concat(
          customCollectionResponse.custom_collections
        )
      }
      if (
        smartCollectionResponse &&
        smartCollectionResponse.smart_collections
      ) {
        collections = collections.concat(
          smartCollectionResponse.smart_collections
        )
      }
      this.collections = collections
      this.loading = false
    })
  }

  componentDidMount() {
    this.safeReaction(
      () => this.searchInputText,
      () => this.searchCollections(),
      {
        delay: 500,
        fireImmediately: true
      }
    )
  }

  render() {
    return (
      <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
        <TextField
          css={{ margin: 15 }}
          value={this.searchInputText}
          placeholder="Search collections..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  css={{ color: '#999', marginRight: -2, fontSize: 20 }}
                />
              </InputAdornment>
            )
          }}
          onChange={e => (this.searchInputText = e.target.value)}
        />
        {this.loading && (
          <CircularProgress disableShrink css={{ margin: '50px auto' }} />
        )}
        <div css={{ maxHeight: '80vh', overflow: 'auto' }}>
          {!this.loading &&
            (this.collections.length ? (
              this.collections.map(item => (
                <div
                  key={item.id}
                  onClick={e => {
                    this.props.onChange(String(item.id))
                  }}
                >
                  <CollectionPreviewCell
                    selected={String(item.id) === this.props.value}
                    button
                    collection={item}
                    key={item.id}
                  />
                </div>
              ))
            ) : (
              <div>
                <Typography
                  css={{
                    margin: '40px 20px',
                    textAlign: 'center',
                    fontSize: 17
                  }}
                  variant="caption"
                >
                  No collections found
                </Typography>
              </div>
            ))}
        </div>
      </div>
    )
  }
}

@observer
export class ShopifyCollectionPicker extends SafeComponent<
  ShopifyCollectionPickerProps
> {
  @computed get loading() {
    return this.collectionInfoCacheValue?.loading
  }

  @computed get collectionInfo() {
    return this.collectionInfoCacheValue?.value?.collection
  }

  @computed get collectionInfoCacheValue() {
    if (!(this.props.context.user.apiKey && this.collectionId)) {
      return null
    }
    return this.props.context.httpCache.get(
      `${apiRoot}/api/v1/shopify/collections/${this.collectionId}.json?apiKey=${this.props.context.user.apiKey}`
    )
  }

  getRequestObject(collectionId: string) {
    // setting a Request object as the value, Builder.io will fetch the given URL
    // and populate that as the `data` property on this object in the return repsonse
    // from the API
    return {
      '@type': '@builder.io/core:Request',
      request: {
        url: `${apiRoot}/api/v1/shopify/collections/{{this.options.collection}}.json?apiKey=${this.props.context.user.apiKey}`
      },
      options: {
        collection: collectionId
      }
    } as BuilderRequest
  }

  get collectionId() {
    return this.props.value?.options?.get('collection') || ''
  }

  set collectionId(value) {
    this.props.onChange(this.getRequestObject(value))
  }

  async getCollection(id: string) {
    return null
  }

  async showChooseCollectionModal() {
    const close = await this.props.context.globalState.openDialog(
      <CollectionPicker
        context={this.props.context}
        value={this.collectionId}
        onChange={value => {
          this.collectionId = value
          close()
        }}
      />,
      true,
      {
        PaperProps: {
          // Align modal to top so doesn't jump around centering itself when
          // grows and shrinks to show more/less collections or loading
          style: {
            alignSelf: 'flex-start'
          }
        }
      }
    )
  }

  get pluginSettings() {
    return fastClone(
      this.props.context.user.organization?.value.settings.plugins.get(
        '@builder.io/plugin-shopify'
      ) || {}
    )
  }

  render() {
    const { apiKey, apiPassword } = this.pluginSettings

    if (!(apiKey && apiPassword)) {
      return <SetShopifyKeysMessage />
    }

    return (
      <div
        css={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}
      >
        {this.collectionInfoCacheValue?.loading && (
          <CircularProgress
            size={20}
            disableShrink
            css={{ margin: '30px auto' }}
          />
        )}
        {this.collectionInfo && (
          <Paper
            css={{
              marginBottom: 15,
              position: 'relative'
            }}
            onClick={() => {
              this.showChooseCollectionModal()
            }}
          >
            <CollectionPreviewCell
              button
              css={{ paddingRight: 30 }}
              collection={this.collectionInfo}
            />
            <IconButton
              css={{
                position: 'absolute',
                right: 2,
                top: 0,
                bottom: 0,
                height: 50,
                marginTop: 'auto',
                marginBottom: 'auto'
              }}
            >
              <Create css={{ color: '#888' }} />
            </IconButton>
          </Paper>
        )}
        {!this.collectionInfo && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              this.showChooseCollectionModal()
            }}
          >
            Choose collection
          </Button>
        )}
      </div>
    )
  }
}

Builder.registerEditor({
  name: 'ShopifyCollection',
  component: ShopifyCollectionPicker
})
