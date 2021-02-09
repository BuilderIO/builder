/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useObserver, useLocalStore } from 'mobx-react';
import {
  ProductPreviewCell,
  ShopifyProductPreviewCellProps,
  ProductPicker,
} from './ShopifyProductPicker';
import { CircularProgress, Button, Typography, Tooltip, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';

export type PickShopifyProductsListProps = {
  value?: string[];
  onChange(newValue: string[]): void;
};

const ProductPreviewById = (props: { id: string } & Partial<ShopifyProductPreviewCellProps>) => {
  const { id, ...rest } = props;
  return useObserver(() => {
    // TODO: HTTP cache, while loading show placeholder loading
    const productCache = appState.httpCache.get(
      `${appState.config.apiRoot()}/api/v1/shopify/products/${id}?apiKey=${appState.user.apiKey}`
    );

    if (productCache.loading) {
      // TODO: fancy material placeholders
      return <CircularProgress disableShrink size={20} />;
    }
    return <ProductPreviewCell product={productCache.value?.product!} {...rest} />;
  });
};

export function PickShopifyProductsList(props: PickShopifyProductsListProps) {
  return useObserver(() => {
    return (
      <React.Fragment>
        <Typography variant="caption" css={{ paddingBottom: 15, textAlign: 'center' }}>
          Choose products
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
                <ProductPreviewById key={item} id={item} />
                <Tooltip title="Remove product">
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
        {/* On click - choose product */}
        <Button
          color="primary"
          variant="outlined"
          fullWidth
          css={{ marginTop: 10 }}
          onClick={() => {
            const close = appState.globalState.openDialog(
              <ProductPicker
                context={appState}
                value={undefined}
                onChange={product => {
                  if (product) {
                    const value = props.value || [];
                    value.push(String(product.id));
                    props.onChange(value);
                  }
                  close();
                }}
              />
            );
          }}
        >
          + Product
        </Button>
      </React.Fragment>
    );
  });
}

export function PickShopifyProductsButton(props: PickShopifyProductsListProps) {
  return useObserver(() => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            appState.globalState.openDialog(
              <div css={{ padding: 30, width: 500, maxWidth: '90vw' }}>
                <PickShopifyProductsList {...props} />
              </div>
            );
          }}
          color="inherit"
          css={{ color: '#999', whiteSpace: 'nowrap' }}
        >
          {props.value?.length || 0} products
        </Button>
      </React.Fragment>
    );
  });
}

Builder.registerEditor({
  name: 'ShopifyProductList',
  component: PickShopifyProductsButton,
});
