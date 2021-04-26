/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/react';
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
  Typography,
} from '@material-ui/core';
import { Create, Search } from '@material-ui/icons';
import { computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import template from 'lodash.template';
import { SafeComponent } from '../components/safe-component';
import { CustomReactEditorProps } from '../interfaces/custom-react-editor-props';
import { BuilderRequest } from '../interfaces/builder-request';
import { ShopifyCollection } from '../interfaces/shopify-collection';
import { SetShopifyKeysMessage } from '../components/set-shopify-keys-message';
import { fastClone } from '../functions/fast-clone';
import appState from '@builder.io/app-context';

interface ShopifyCollectionPickerProps extends CustomReactEditorProps<BuilderRequest | string> {
  isPreview?: boolean;
  handleOnly?: boolean;
}

export interface ShopifyCollectionPreviewCellProps {
  collection: ShopifyCollection;
  button?: boolean;
  selected?: boolean;
  className?: string;
}

@observer
export class CollectionPreviewCell extends SafeComponent<ShopifyCollectionPreviewCellProps> {
  render() {
    return (
      <ListItem
        className={this.props.className}
        button={this.props.button}
        selected={this.props.selected}
      >
        {this.props.collection.image && (
          <ListItemAvatar>
            <Avatar css={{ borderRadius: 4 }} src={this.props.collection.image.src} />
          </ListItemAvatar>
        )}
        <ListItemText primary={this.props.collection.handle} />
      </ListItem>
    );
  }
}

@observer
export class CollectionPicker extends SafeComponent<
  CustomReactEditorProps<ShopifyCollection> & { title?: string }
> {
  @observable searchInputText = '';
  @observable loading = false;

  @observable collections: ShopifyCollection[] = [];

  async searchCollections() {
    this.loading = true;
    const shopifyCustomCollectionsUrl =
      appState.config.apiRoot() + '/api/v1/shopify/custom_collections.json';
    const shopifySmartCollectionsUrl =
      appState.config.apiRoot() + '/api/v1/shopify/smart_collections.json';

    const onShopifyError = (err: any) => {
      console.error('Shopify collection search error:', err);
      this.props.context.snackBar.show(
        'Oh no! There was an error syncing your page to Shopify. Please contact us for support'
      );
    };

    // const agent =
    // TODO: cancen pending requests if any
    const customCollectionQuery = fetch(
      `${shopifyCustomCollectionsUrl}?apiKey=${
        this.props.context.user.apiKey
      }&title=${encodeURIComponent(this.searchInputText)}&limit=40`
    )
      .then(res => res.json())
      .catch(onShopifyError);

    const smartCollectionQuery = fetch(
      `${shopifySmartCollectionsUrl}?apiKey=${
        this.props.context.user.apiKey
      }&title=${encodeURIComponent(this.searchInputText)}&limit=40`
    )
      .then(res => res.json())
      .catch(onShopifyError);
    const [smartCollectionResponse, customCollectionResponse] = await Promise.all([
      smartCollectionQuery,
      customCollectionQuery,
    ]);

    runInAction(() => {
      let collections: any[] = [];
      if (customCollectionResponse && customCollectionResponse.custom_collections) {
        collections = collections.concat(customCollectionResponse.custom_collections);
      }
      if (smartCollectionResponse && smartCollectionResponse.smart_collections) {
        collections = collections.concat(smartCollectionResponse.smart_collections);
      }
      this.collections = collections;
      this.loading = false;
    });
  }

  componentDidMount() {
    this.safeReaction(
      () => this.searchInputText,
      () => this.searchCollections(),
      {
        delay: 500,
        fireImmediately: true,
      }
    );
  }

  render() {
    return (
      <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
        <TextField
          css={{ margin: 15 }}
          value={this.searchInputText}
          placeholder={this.props.title || 'Search collections...'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search css={{ color: '#999', marginRight: -2, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          onChange={e => (this.searchInputText = e.target.value)}
        />
        {this.loading && <CircularProgress disableShrink css={{ margin: '50px auto' }} />}
        <div css={{ maxHeight: '80vh', overflow: 'auto' }}>
          {!this.loading &&
            (this.collections.length ? (
              this.collections.map(item => (
                <div
                  key={item.id}
                  onClick={e => {
                    this.props.onChange(item);
                  }}
                >
                  <CollectionPreviewCell
                    selected={String(item.id) === String(this.props.value?.id)}
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
                    fontSize: 17,
                  }}
                  variant="caption"
                >
                  No collections found
                </Typography>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

@observer
export class ShopifyCollectionPicker extends SafeComponent<ShopifyCollectionPickerProps> {
  @computed get loading() {
    return this.collectionInfoCacheValue?.loading;
  }

  @computed get collectionInfo() {
    return this.collectionHandle
      ? this.collectionInfoCacheValue?.value?.collections?.[0]
      : this.collectionInfoCacheValue?.value?.collection;
  }

  @computed get collectionInfoCacheValue() {
    const id = this.collectionId || this.collectionHandle;
    const apiKey = this.props.context.user.apiKey;
    if (!(apiKey && id)) {
      return null;
    }
    return this.collectionId
      ? this.props.context.httpCache.get(
          `${appState.config.apiRoot()}/api/v1/shopify/collections/${
            this.collectionId
          }.json?apiKey=${apiKey}`
        )
      : this.props.context.httpCache.get(
          `${appState.config.apiRoot()}/api/v1/shopify/search/collection?search=${id}&apiKey=${apiKey}`
        );
  }

  getRequestObject(collectionId: string) {
    // setting a Request object as the value, Builder.io will fetch the given URL
    // and populate that as the `data` property on this object in the return repsonse
    // from the API
    return {
      '@type': '@builder.io/core:Request',
      request: {
        url: `${appState.config.apiRoot()}/api/v1/shopify/collections/{{this.options.collection}}.json?apiKey=${
          this.props.context.user.apiKey
        }`,
      },
      options: {
        collection: collectionId,
      },
    } as BuilderRequest;
  }

  get collectionId() {
    if (this.props.handleOnly) {
      return '';
    }
    return typeof this.props.value === 'string'
      ? this.props.value
      : this.props.value?.options?.get('collection') || '';
  }

  set collectionId(value) {
    if (this.props.handleOnly) {
      return;
    }
    if (this.props.field?.isTargeting) {
      this.props.onChange(value);
    } else {
      this.props.onChange(this.getRequestObject(value));
    }
  }

  get collectionHandle() {
    return this.props.handleOnly && typeof this.props.value === 'string'
      ? this.props.value
      : undefined;
  }

  set collectionHandle(value) {
    if (this.props.handleOnly) {
      this.props.onChange(value);
    }
  }

  async showChooseCollectionModal(title?: string) {
    const close = await this.props.context.globalState.openDialog(
      <CollectionPicker
        title={title}
        context={this.props.context}
        value={this.collectionId}
        onChange={value => {
          this.collectionId = value?.id;
          this.collectionHandle = value?.handle;
          close();
        }}
      />,
      true,
      {
        PaperProps: {
          // Align modal to top so doesn't jump around centering itself when
          // grows and shrinks to show more/less collections or loading
          style: {
            alignSelf: 'flex-start',
          },
        },
      }
    );
  }

  get pluginSettings() {
    return fastClone(
      this.props.context.user.organization?.value.settings.plugins.get(
        '@builder.io/plugin-shopify'
      ) || {}
    );
  }

  componentDidMount() {
    const hasPreviewFields = Boolean(
      appState.designerState.editingModel?.fields.find(
        (field: { type: string }) => field.type === 'ShopifyCollectionPreview'
      )
    );

    if (
      hasPreviewFields &&
      this.props.context.globalState.globalDialogs.length === 0 &&
      this.props.context.designerState.editingContentModel &&
      this.props.isPreview &&
      (!this.props.value || this.collectionInfoCacheValue?.error)
    ) {
      this.showChooseCollectionModal('Pick a collection to preview');
    }
  }

  render() {
    const { apiKey, apiPassword } = this.pluginSettings;

    if (!(apiKey && apiPassword)) {
      return <SetShopifyKeysMessage />;
    }

    return (
      <div css={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
        {this.collectionInfoCacheValue?.loading && (
          <CircularProgress size={20} disableShrink css={{ margin: '30px auto' }} />
        )}
        {this.collectionInfo && (
          <Paper
            css={{
              marginBottom: 15,
              position: 'relative',
            }}
            onClick={() => {
              this.showChooseCollectionModal();
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
                marginBottom: 'auto',
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
              this.showChooseCollectionModal();
            }}
          >
            Choose collection
          </Button>
        )}
      </div>
    );
  }
}

Builder.registerEditor({
  name: 'ShopifyCollection',
  component: ShopifyCollectionPicker,
});

Builder.registerEditor({
  name: 'ShopifyCollectionPreview',
  component: (props: ShopifyCollectionPickerProps) => (
    <ShopifyCollectionPicker {...props} isPreview />
  ),
});

Builder.registerEditor({
  name: 'ShopifyCollectionHandle',
  component: (props: ShopifyCollectionPickerProps) => (
    <ShopifyCollectionPicker {...props} handleOnly />
  ),
});
