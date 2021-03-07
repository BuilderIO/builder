/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { action } from 'mobx';
import { useObserver, useLocalStore } from 'mobx-react';
import {
  CollectionPreviewCell,
  EcomCollectionPreviewCellProps,
  CollectionPicker,
} from './EcomCollectionPicker';
import { CircularProgress, Button, Typography, Tooltip, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import appState from '@builder.io/app-context';
import { EcomCollection } from '../interfaces/ecom-collection';

export type PickEcomCollectionsListProps = {
  api: any;
  value?: string[];
  onChange(newValue: string[]): void;
  onDone(): void;
};

const CollectionPreviewById = (
  props: { id: string; api: any } & Partial<EcomCollectionPreviewCellProps>
) => {
  const { id, ...rest } = props;
  const store = useLocalStore(() => ({
    loading: false,
    collectionInfo: null as EcomCollection | null,
    async getCollection() {
      this.loading = true;
      try {
        const value = await props.api.getCollectionById(props.id);
        this.collectionInfo = value;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },
  }));
  useEffect(() => {
    store.getCollection();
  }, []);

  return useObserver(() => {
    // TODO: HTTP cache, while loading show placeholder loading

    if (store.loading) {
      // TODO: fancy material placeholders
      return <CircularProgress disableShrink size={20} />;
    }
    return (
      (store.collectionInfo && (
        <CollectionPreviewCell collection={store.collectionInfo} {...rest} />
      )) || <React.Fragment></React.Fragment>
    );
  });
};

export function PickEcomCollectionsList(props: PickEcomCollectionsListProps) {
  const store = useLocalStore(() => ({
    get value() {
      return props.value || [];
    },
  }));
  return useObserver(() => {
    return (
      <React.Fragment>
        <Typography variant="caption" css={{ paddingBottom: 15, textAlign: 'center' }}>
          Choose collections
        </Typography>
        <div>
          {store.value?.map((item, index) => (
            <div
              css={{
                display: 'flex',
                '&:hover button': {
                  opacity: 1,
                },
              }}
              key={index}
            >
              <CollectionPreviewById key={item} id={item} api={props.api} />
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
                    const res = [...props.value!].splice(props.value!.indexOf(item) + 1, 1);
                    props.onChange(res);
                  }}
                >
                  <Close />
                </IconButton>
              </Tooltip>
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
                omitIds={store.value}
                onChange={action(collection => {
                  if (collection) {
                    props.onChange([...(store.value || []), String(collection.id)]);
                  }
                  close();
                })}
              />
            );
          }}
        >
          + Collection
        </Button>
        <Button
          color="primary"
          variant="outlined"
          fullWidth
          css={{ marginTop: 10 }}
          onClick={props.onDone}
        >
          Done
        </Button>
      </React.Fragment>
    );
  });
}

export function PickEcomCollectionsButton(props: Omit<PickEcomCollectionsListProps, 'onDone'>) {
  useEffect(() => {
    if (typeof props.value === 'undefined') {
      props.onChange([]);
    }
  }, []);

  return useObserver(() => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            const close = appState.globalState.openDialog(
              <div css={{ padding: 30, width: 500, maxWidth: '90vw' }}>
                <PickEcomCollectionsList {...props} onDone={() => close()} />
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
