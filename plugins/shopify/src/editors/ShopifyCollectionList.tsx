/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import {
  CollectionPreviewCell,
  CollectionPicker,
  ShopifyCollectionPreviewCellProps,
} from './ShopifyCollectionPicker';

import {
  CircularProgress,
  Button,
  Dialog,
  IconButton,
  Typography,
  Tooltip,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';

export type PickShopifyCollectionsListProps = {
  value?: string[];
  onChange(newValue: string[]): void;
};

const CollectionPreviewById = (
  props: { id?: string } & Partial<ShopifyCollectionPreviewCellProps>
) => {
  const { id, ...rest } = props;
  return useObserver(() => {
    // TODO: HTTP cache, while loading show placeholder loading
    const collectionCache = appState.httpCache.get(
      `${appState.config.apiRoot()}/api/v1/shopify/collections/${id}?apiKey=${appState.user.apiKey}`
    );

    if (collectionCache.loading) {
      // TODO: fancy material placeholders
      return <CircularProgress disableShrink size={20} />;
    }
    return <CollectionPreviewCell collection={collectionCache.value?.collection!} {...rest} />;
  });
};

export function PickShopifyCollectionsList(props: PickShopifyCollectionsListProps) {
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
                <CollectionPreviewById key={item} id={item} />
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

export function PickShopifyCollectionsButton(props: PickShopifyCollectionsListProps) {
  return useObserver(() => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            appState.globalState.openDialog(
              <div css={{ padding: 30, width: 500, maxWidth: '90vw' }}>
                <PickShopifyCollectionsList {...props} />
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

Builder.registerEditor({
  name: 'ShopifyCollectionList',
  component: PickShopifyCollectionsButton,
});
