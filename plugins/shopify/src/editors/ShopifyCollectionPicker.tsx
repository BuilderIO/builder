import React from 'react';
import { SafeComponent } from '../../classes/safe-component.class';
import { observer } from 'mobx-react';
import { CustomReactEditorProps } from '../../components/FieldsForm';
import { computed, observable, reaction, runInAction } from 'mobx';
import {
  Button,
  TextField,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from '@material-ui/core';
import { appState } from '../../constants/app-state.constant';
// import { ShopifyCollection } from '../interfaces/shopify-collection';
import { isDev } from '../../constants/environment.constant';
import { reportException } from '../../functions/report-exception';
import { Builder } from '@builder.io/react';
import { nextTick } from '../../functions/next-tick.function';
import { Create, Search } from '@material-ui/icons';
import { theme } from '../../constants/theme.constant';

type ShopifyCollection = any; // TODO

// TODO: implement
nextTick(() => {
  reaction(
    () => appState.user.isShopify,
    isShopify => {
      if (isShopify) {
        Builder.registerEditor({
          name: 'ShopifyCollection',
          component: ShopifyCollectionPicker,
        });
      } else {
        const index = Builder.editors.findIndex(item => item.name === 'ShopifyCollection');
        if (index !== -1) {
          Builder.editors.splice(index, 1);
        }
      }
    },
    {
      fireImmediately: true,
    }
  );
});

const apiRoot = isDev ? 'http://localhost:5000' : 'https://builder.io';

interface ShopifyCollectionPickerProps extends CustomReactEditorProps<string> {}

interface ShopifyCollectionPreviewCellProps {
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
export class CollectionPicker extends SafeComponent<ShopifyCollectionPickerProps> {
  @observable searchInputText = '';
  @observable loading = false;

  @observable collections: ShopifyCollection[] = [];

  async searchCollections() {
    this.loading = true;
    const shopifyCustomCollectionsUrl = apiRoot + '/api/v1/shopify/custom_collections.json';
    const shopifySmartCollectionsUrl = apiRoot + '/api/v1/shopify/smart_collections.json';

    const onShopifyError = (err: any) => {
      console.error('Shopify collection search error:', err);
      reportException(err);
      appState.snackBar.show(
        'Oh no! There was an error syncing your page to Shopify. Please contact us for support'
      );
    };

    // const agent =
    // TODO: cancen pending requests if any
    const customCollectionQuery = fetch(
      `${shopifyCustomCollectionsUrl}?apiKey=${appState.user.apiKey}&title=${encodeURIComponent(
        this.searchInputText
      )}&limit=40`
    )
      .then(res => res.json())
      .catch(onShopifyError);

    const smartCollectionQuery = fetch(
      `${shopifySmartCollectionsUrl}?apiKey=${appState.user.apiKey}&title=${encodeURIComponent(
        this.searchInputText
      )}&limit=40`
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
          placeholder="Search collections..."
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
                    this.props.onChange(String(item.id));
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
                  css={{ margin: '40px 20px', textAlign: 'center', fontSize: 17 }}
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
    return this.collectionInfoCacheValue?.value?.collection;
  }

  @computed get collectionInfoCacheValue() {
    if (!(appState.user.apiKey && this.value)) {
      return null;
    }
    return appState.httpCache.get<{ collection: ShopifyCollection }>(
      `${apiRoot}/api/v1/shopify/collections/${this.value}.json?apiKey=${appState.user.apiKey}`
    );
  }

  get value() {
    return this.props.value;
  }

  set value(value) {
    this.props.onChange(value);
  }

  async getCollection(id: string) {
    return null;
  }

  async showChooseCollectionModal() {
    const close = await appState.globalState.openDialog(
      <CollectionPicker
        value={this.value}
        onChange={value => {
          console.log('onchange', value);
          this.props.onChange(value);
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

  render() {
    return (
      <>
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
                <Create css={{ color: theme.colors.primary }} />
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
      </>
    );
  }
}
