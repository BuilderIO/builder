/** @jsx jsx */
import { jsx } from '@emotion/core';
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
import { Resource } from '../interfaces/resource';
import { BuilderRequest } from '../interfaces/builder-request';
import { SetEcomKeysMessage } from '../components/set-keys-message';
import { CommerceAPIOperations } from '..';
import pluralize from 'pluralize';

export interface ResourcesPickerButtonProps
  extends CustomReactEditorProps<BuilderRequest | string> {
  isPreview?: boolean;
  handleOnly?: boolean;
  api: CommerceAPIOperations;
  pluginId: string;
  pluginName: string;
  resourceName: string;
  previewType?: string;
}

export interface ResourcePreviewCellProps {
  resource: Resource;
  button?: boolean;
  selected?: boolean;
  className?: string;
}

export const ResourcePreviewCell: React.FC<ResourcePreviewCellProps> = props =>
  useObserver(() => (
    <ListItem className={props.className} button={props.button} selected={props.selected}>
      {props.resource.image && (
        <ListItemAvatar>
          <Avatar css={{ borderRadius: 4 }} src={props.resource.image.src} />
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
            {props.resource.title}
          </div>
        }
      />
    </ListItem>
  ));

export const ResourcePicker: React.FC<
  CustomReactEditorProps<Resource> & {
    api: CommerceAPIOperations;
    omitIds?: string[];
    resourceName: string;
    title?: string;
  }
> = props => {
  const store = useLocalStore(() => ({
    searchInputText: '',
    loading: false,
    resources: [] as Resource[],
    async search() {
      this.loading = true;
      const catchError = (err: any) => {
        console.error('search error:', err);
        props.context.snackBar.show('Oh no! There was an error searching for resources');
      };

      const resourcesResponse = await props.api[props.resourceName]
        .search(store.searchInputText)
        .catch(catchError);

      runInAction(() => {
        if (Array.isArray(resourcesResponse)) {
          this.resources = resourcesResponse.filter(
            resource => !(props.omitIds || []).includes(String(resource.id))
          );
        }
        this.loading = false;
      });
    },
  }));

  useEffect(() => {
    store.search();
  }, [store.searchInputText]);

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
      <TextField
        css={{ margin: 15 }}
        value={store.searchInputText}
        placeholder={props.title || `Search ${pluralize.plural(props.resourceName)}...`}
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
          (store.resources.length ? (
            store.resources.map(item => (
              <div
                key={item.id}
                onClick={e => {
                  props.onChange(item);
                }}
              >
                <ResourcePreviewCell
                  selected={String(item.id) === String(props.value?.id)}
                  button
                  resource={item}
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
                No {pluralize.plural(props.resourceName)} found
              </Typography>
            </div>
          ))}
      </div>
    </div>
  ));
};

export const ResourcesPickerButton: React.FC<ResourcesPickerButtonProps> = props => {
  const store = useLocalStore(() => ({
    loading: false,
    error: null,
    resourceInfo: null as Resource | null,
    resourceHandle: props.handleOnly && typeof props.value === 'string' ? props.value : undefined,
    resourceId: props.handleOnly
      ? undefined
      : typeof props.value === 'string'
      ? props.value
      : props.value?.options?.get(props.resourceName),
    async getResource() {
      this.error = null;
      this.loading = true;
      try {
        const resourceService = props.api[props.resourceName];
        const value =
          (this.resourceId && (await resourceService.findById(this.resourceId))) ||
          (this.resourceHandle &&
            resourceService.findByHandle &&
            (await resourceService.findByHandle(this.resourceHandle)));
        this.resourceInfo = value || null;
      } catch (e) {
        console.error(e);
        this.error = e;
        props.context.snackBar.show(
          `Oh no! There was an error fetching ${pluralize.plural(props.resourceName)}`
        );
      }
      this.loading = false;
    },
    async showPickResouceModal(title?: string) {
      const close = await props.context.globalState.openDialog(
        <ResourcePicker
          resourceName={props.resourceName}
          api={props.api}
          context={props.context}
          {...(this.resourceInfo && { value: this.resourceInfo })}
          title={title}
          onChange={action(value => {
            if (value) {
              this.resourceHandle = value.handle;
              this.resourceId = String(value.id);
              this.getResource();
              if (props.handleOnly) {
                props.onChange(this.resourceHandle);
              } else {
                if (props.field?.isTargeting) {
                  props.onChange(this.resourceId);
                } else {
                  props.onChange(
                    props.api[props.resourceName].getRequestObject(this.resourceId, value)
                  );
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
            // grows and shrinks to show more/less resources or loading
            style: {
              alignSelf: 'flex-start',
            },
          },
        }
      );
    },
  }));

  useEffect(() => {
    store.getResource();
  }, []);

  useEffect(() => {
    const hasPreviewFields = Boolean(
      props.context.designerState.editingModel?.fields.find(
        (field: { type: string }) => field.type === props.previewType
      )
    );
    if (
      hasPreviewFields &&
      props.context.globalState.globalDialogs.length === 0 &&
      props.context.designerState?.editingContentModel &&
      props.isPreview &&
      (!props.value || store.error)
    ) {
      setTimeout(() => store.showPickResouceModal(`Pick a ${props.resourceName} to preview`));
    }
  }, [store.error]);

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
        {store.resourceInfo && (
          <Paper
            css={{
              marginBottom: 15,
              position: 'relative',
            }}
          >
            <ResourcePreviewCell button css={{ paddingRight: 30 }} resource={store.resourceInfo} />
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
                store.showPickResouceModal();
              }}
            >
              <Create css={{ color: '#888' }} />
            </IconButton>
          </Paper>
        )}
        {!store.resourceInfo && !store.loading && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              store.showPickResouceModal();
            }}
          >
            Choose {props.resourceName}
          </Button>
        )}
      </div>
    );
  });
};
