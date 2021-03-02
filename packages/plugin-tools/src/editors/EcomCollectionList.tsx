/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import {
  CollectionPreviewCell,
  CollectionPicker,
  EcomCollectionPreviewCellProps,
} from './EcomCollectionPicker';

import { CircularProgress, Button, IconButton, Typography, Tooltip } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import appState from '@builder.io/app-context';

export type PickEcomCollectionsListProps = {
  value?: string[];
  onChange(newValue: string[]): void;
  api: any;
};

const CollectionPreviewById = (
  props: { id?: string; api: any } & Partial<EcomCollectionPreviewCellProps>
) => {
  const { id, ...rest } = props;
  return useObserver(() => {
    // TODO: HTTP cache, while loading show placeholder loading
    const collectionCache = props.api.getCollectionById(id);

    if (collectionCache.loading) {
      // TODO: fancy material placeholders
      return <CircularProgress disableShrink size={20} />;
    }
    return <CollectionPreviewCell collection={collectionCache.value?.collection!} {...rest} />;
  });
};

export function PickEcomCollectionsList(props: PickEcomCollectionsListProps) {
  const state = useLocalStore(useProps => ({}), props);

  return useObserver(() => {
    return (
      <React.Fragment>
        <Typography variant="caption" css={{ paddingBottom: 15, textAlign: 'center' }}>
          Choose collections
        </Typography>
        <div>
          {props.value?.map((item, index) => (
            <div>
              {index > 0 && (
                <div css={{ padding: 5, fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>
                  - or -
                </div>
              )}
              <div
                css={{
                  display: 'flex',
                  '&:hover button': {
                    opacity: 1,
                  },
                }}
                key={item}
              >
                <CollectionPreviewById api={props.api} key={item} id={item} />
                <Tooltip title="Remove collection">
                  <IconButton
                    css={{
                      opacity: 0,
                      transition: 'opacity 0.2s ease-in-out',
                      padding: 5,
                      marginLeft: 'auto',
                      alignSelf: 'center',
                    }}
                    onClick={() => {
                      props.value!.splice(props.value!.indexOf(item), 1);
                    }}
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
        {/* On click - choose collection */}
        <Button
          color="primary"
          variant="outlined"
          fullWidth
          css={{ marginTop: 10 }}
          onClick={() => {
            const close = appState.globalState.openDialog(
              <CollectionPicker
                api={props.api}
                context={appState}
                value={undefined}
                onChange={collection => {
                  if (collection?.id) {
                    const value = props.value || [];
                    value.push(String(collection.id));
                    props.onChange(value);
                  }
                  close();
                }}
              />
            );
          }}
        >
          + Collection
        </Button>
      </React.Fragment>
    );
  });
}

export function PickEcomCollectionsButton(props: PickEcomCollectionsListProps) {
  return useObserver(() => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            appState.globalState.openDialog(
              <div css={{ padding: 30, width: 500, maxWidth: '90vw' }}>
                <PickEcomCollectionsList {...props} />
              </div>
            );
          }}
          color="inherit"
          css={{ color: '#999', whiteSpace: 'nowrap' }}
        >
          {props.value?.length || 0} collections
        </Button>
      </React.Fragment>
    );
  });
}
