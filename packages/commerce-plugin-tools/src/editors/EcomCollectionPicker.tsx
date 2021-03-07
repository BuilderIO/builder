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
import { runInAction, action } from 'mobx';
import { useObserver, useLocalStore } from 'mobx-react';
import React, { useEffect } from 'react';
import { CustomReactEditorProps } from '../interfaces/custom-react-editor-props';
import { EcomCollection } from '../interfaces/ecom-collection';
import { BuilderRequest } from '../interfaces/builder-request';
import { SetEcomKeysMessage } from '../components/set-keys-message';

export interface EcomCollectionPickerProps extends CustomReactEditorProps<BuilderRequest | string> {
  isPreview?: boolean;
  handleOnly?: boolean;
  api: any;
  pluginId: string;
  pluginName: string;
}

export interface EcomCollectionPreviewCellProps {
  collection: EcomCollection;
  button?: boolean;
  selected?: boolean;
  className?: string;
}

export const CollectionPreviewCell: React.FC<EcomCollectionPreviewCellProps> = props =>
  useObserver(() => (
    <ListItem className={props.className} button={props.button} selected={props.selected}>
      {props.collection.image ? (
        <ListItemAvatar>
          <Avatar css={{ borderRadius: 4 }} src={props.collection.image.src} />
        </ListItemAvatar>
      ) : (
        <ListItemAvatar>
          <Avatar css={{ borderRadius: 4 }} />
        </ListItemAvatar>
      )}
      <ListItemText
        primary={
          <div
            css={{
              maxWidth: 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {props.collection.title}
          </div>
        }
      />
    </ListItem>
  ));

export const CollectionPicker: React.FC<
  CustomReactEditorProps<EcomCollection> & { api: any; omitIds?: string[] }
> = props => {
  const store = useLocalStore(() => ({
    searchInputText: '',
    loading: false,
    collections: [] as EcomCollection[],
    async searchCollections() {
      this.loading = true;
      const onEcomError = (err: any) => {
        console.error('Ecom collection search error:', err);
        props.context.snackBar.show('Oh no! There was an error searching for collections');
      };

      const collectionsResponse = await props.api
        .searchCollections(store.searchInputText)
        .catch(onEcomError);

      runInAction(() => {
        if (Array.isArray(collectionsResponse)) {
          this.collections = collectionsResponse.filter(
            collection => !(props.omitIds || []).includes(collection.id)
          );
        }
        this.loading = false;
      });
    },
  }));

  useEffect(() => {
    store.searchCollections();
  }, [store.searchInputText]);

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
      <TextField
        css={{ margin: 15 }}
        value={store.searchInputText}
        placeholder="Search collections..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search css={{ color: '#999', marginRight: -2, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        onChange={action(e => (store.searchInputText = e.target.value))}
      />
      {store.loading && <CircularProgress disableShrink css={{ margin: '50px auto' }} />}
      <div css={{ maxHeight: '80vh', overflow: 'auto' }}>
        {!store.loading &&
          (store.collections.length ? (
            store.collections.map(item => (
              <div
                key={item.id}
                onClick={e => {
                  props.onChange(item);
                }}
              >
                <CollectionPreviewCell
                  selected={String(item.id) === String(props.value?.id)}
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
  ));
};

export const EcomCollectionPicker: React.FC<EcomCollectionPickerProps> = props => {
  const store = useLocalStore(() => ({
    loading: false,
    collectionInfo: null as EcomCollection | null,
    collectionHandle: props.handleOnly && typeof props.value === 'string' ? props.value : undefined,
    collectionId: props.handleOnly && typeof props.value === 'string' ? props.value : undefined,
    async getCollection() {
      this.loading = true;
      try {
        const value =
          (this.collectionId && (await props.api.getCollectionById(this.collectionId))) ||
          (this.collectionHandle && (await props.api.getCollectionByHandle(this.collectionHandle)));
        this.collectionInfo = value;
      } catch (e) {
        console.error(e);
        props.context.snackBar.show('Oh no! There was an error fetching collection');
      }
      this.loading = false;
    },
    async showChooseCollectionModal() {
      const close = await props.context.globalState.openDialog(
        <CollectionPicker
          api={props.api}
          context={props.context}
          {...(this.collectionInfo && { value: this.collectionInfo })}
          onChange={action(value => {
            if (value) {
              this.collectionHandle = value.handle;
              this.collectionId = String(value.id);
              this.getCollection();
              if (props.handleOnly) {
                props.onChange(this.collectionHandle);
              } else {
                if (props.field?.isTargeting) {
                  props.onChange(this.collectionId);
                } else {
                  props.onChange(props.api.getRequestObject(this.collectionId));
                }
              }
            }
            close();
          })}
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
    },
  }));

  return useObserver(() => {
    const pluginSettings = props.context.user.organization.value.settings.plugins.get(
      props.pluginId
    );

    if (!pluginSettings.get('hasConnected')) {
      return <SetEcomKeysMessage pluginId={props.pluginId} pluginName={props.pluginName} />;
    }
    return (
      <div css={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
        {store.loading && (
          <CircularProgress size={20} disableShrink css={{ margin: '30px auto' }} />
        )}
        {store.collectionInfo && (
          <Paper
            css={{
              marginBottom: 15,
              position: 'relative',
            }}
          >
            <CollectionPreviewCell
              button
              css={{ paddingRight: 30 }}
              collection={store.collectionInfo}
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
              onClick={() => {
                store.showChooseCollectionModal();
              }}
            >
              <Create css={{ color: '#888' }} />
            </IconButton>
          </Paper>
        )}
        {!store.collectionInfo && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              store.showChooseCollectionModal();
            }}
          >
            Choose collection
          </Button>
        )}
      </div>
    );
  });
};
