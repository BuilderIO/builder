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
import pluralize from 'pluralize';
import throttle from 'lodash/throttle';

export interface CommerceAPIOperations {
  [resourceName: string]: {
    resourcePicker?: React.FC<ResourcePickerProps>;
    findById(id: string): Promise<Resource>;
    findByHandle?(handle: string): Promise<Resource>;
    search(search: string, offset?: number, limit?: number): Promise<Resource[]>;
    getRequestObject(id: string, resource?: Resource): BuilderRequest;
  };
}

export interface ResourcesPickerButtonProps
  extends CustomReactEditorProps<BuilderRequest | string> {
  isPreview?: boolean;
  handleOnly?: boolean;
  api: CommerceAPIOperations;
  resourcePicker?: React.FC<ResourcePickerProps>;
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

export type ResourcePickerProps = CustomReactEditorProps<Resource> & {
  api: CommerceAPIOperations;
  omitIds?: string[];
  resourceName: string;
  title?: string;
};

export const ResourcePicker: React.FC<ResourcePickerProps> = props => {
  const store = useLocalStore(() => ({
    searchInputText: '',
    loading: false,
    resources: [] as Resource[],
    search: throttle(async () => {
      store.loading = true;
      const catchError = (err: any) => {
        console.error('search error:', err);
        props.context.snackBar.show('Oh no! There was an error searching for resources');
      };

      const resourcesResponse = await props.api[props.resourceName]
        .search(store.searchInputText)
        .catch(catchError);

      runInAction(() => {
        if (Array.isArray(resourcesResponse)) {
          store.resources = resourcesResponse.filter(
            resource => !(props.omitIds || []).includes(String(resource.id))
          );
        }
        store.loading = false;
      });
    }, 400),
  }));

  useEffect(() => {
    store.search();
  }, [store.searchInputText]);

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500, padding: 30 }}>
      <TextField
        css={{ marginBottom: 10 }}
        value={store.searchInputText}
        placeholder={props.title || `Search ${pluralize.plural(props.resourceName)}...`}
        InputProps={{
          style: {
            padding: '8px 0px',
          },
          startAdornment: (
            <InputAdornment css={{ margin: '8px -2px 8px 8px' }} position="start">
              <Search css={{ color: 'var(--off-background-7)', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        onChange={action(e => (store.searchInputText = e.target.value))}
      />
      {store.loading && <CircularProgress disableShrink css={{ margin: '50px auto' }} />}
      <div>
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
        this.error = e as any;
        props.context.snackBar.show(
          `Oh no! There was an error fetching ${pluralize.plural(props.resourceName)}`
        );
      }
      this.loading = false;
    },
    async showPickResouceModal(title?: string) {
      const { value, resourcePicker, ...rest } = props;
      const PickerCompnent = resourcePicker || ResourcePicker;

      const close = await props.context.globalState.openDialog(
        <PickerCompnent
          {...rest}
          resourceName={props.resourceName}
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
        false,
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
