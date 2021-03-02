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
import { SafeComponent } from '../components/safe-component';
import { CustomReactEditorProps } from '../interfaces/custom-react-editor-props';
import { BuilderRequest } from '../interfaces/builder-request';
import { EcomCollection } from '../interfaces/ecom-collection';
import { SetEcomKeysMessage } from '../components/set-keys-message';
import { fastClone } from '../functions/fast-clone';

export interface EcomCollectionPickerProps extends CustomReactEditorProps<BuilderRequest | string> {
  isPreview?: boolean;
  api: any;
  handleOnly?: boolean;
  pluginId: string;
  pluginName: string;
}

export interface EcomCollectionPreviewCellProps {
  collection: EcomCollection;
  button?: boolean;
  selected?: boolean;
  className?: string;
}

@observer
export class CollectionPreviewCell extends SafeComponent<EcomCollectionPreviewCellProps> {
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
  CustomReactEditorProps<EcomCollection> & { api: any }
> {
  @observable searchInputText = '';
  @observable loading = false;

  @observable collections: EcomCollection[] = [];

  async searchCollections() {
    this.loading = true;
    const onEcomError = (err: any) => {
      console.error('Ecom collection search error:', err);
      this.props.context.snackBar.show(
        'Oh no! There was an error syncing your page to Ecom. Please contact us for support'
      );
    };

    const collections = await this.props.api
      .searchCollections(this.searchInputText)
      .catch(onEcomError);

    runInAction(() => {
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
export class EcomCollectionPicker extends SafeComponent<EcomCollectionPickerProps> {
  @computed get loading() {
    return this.collectionInfoCacheValue?.loading;
  }

  @computed get collectionInfo() {
    return this.collectionInfoCacheValue?.value;
  }

  @computed get collectionInfoCacheValue() {
    const id = this.collectionId || this.collectionHandle;
    const apiKey = this.props.context.user.apiKey;
    if (!(apiKey && id)) {
      return null;
    }
    return this.collectionId
      ? this.props.api.getCollectionById(id)
      : this.props.api.getCollectionByHandle(id);
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
      this.props.onChange(this.props.api.getRequestObject(value)); // collection id mpped to remote request object
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

  async showChooseCollectionModal() {
    const close = await this.props.context.globalState.openDialog(
      <CollectionPicker
        api={this.props.api}
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
      this.props.context.user.organization?.value.settings.plugins.get(this.props.pluginId) || {}
    );
  }

  render() {
    const { apiKey, apiPassword } = this.pluginSettings;

    if (!(apiKey && apiPassword)) {
      return (
        <SetEcomKeysMessage pluginName={this.props.pluginName} pluginId={this.props.pluginId} />
      );
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
