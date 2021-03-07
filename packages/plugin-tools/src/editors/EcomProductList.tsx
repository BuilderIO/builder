/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { action } from 'mobx';
import { useObserver, useLocalStore } from 'mobx-react';
import {
  ProductPreviewCell,
  EcomProductPreviewCellProps,
  ProductPicker,
} from './EcomProductPicker';
import { CircularProgress, Button, Typography, Tooltip, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import appState from '@builder.io/app-context';
import { EcomProduct } from '../interfaces/ecom-product';

export type PickEcomProductsListProps = {
  api: any;
  value?: string[];
  onChange(newValue: string[]): void;
  onDone(): void;
};

const ProductPreviewById = (
  props: { id: string; api: any } & Partial<EcomProductPreviewCellProps>
) => {
  const { id, ...rest } = props;
  const store = useLocalStore(() => ({
    loading: false,
    productInfo: null as EcomProduct | null,
    async getProduct() {
      this.loading = true;
      try {
        const value = await props.api.getProductById(props.id);
        this.productInfo = value;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },
  }));
  useEffect(() => {
    store.getProduct();
  }, []);

  return useObserver(() => {
    // TODO: HTTP cache, while loading show placeholder loading

    if (store.loading) {
      // TODO: fancy material placeholders
      return <CircularProgress disableShrink size={20} />;
    }
    return (
      (store.productInfo && <ProductPreviewCell product={store.productInfo} {...rest} />) || (
        <React.Fragment></React.Fragment>
      )
    );
  });
};

export function PickEcomProductsList(props: PickEcomProductsListProps) {
  const store = useLocalStore(() => ({
    get value() {
      return props.value || [];
    },
  }));
  return useObserver(() => {
    return (
      <React.Fragment>
        <Typography variant="caption" css={{ paddingBottom: 15, textAlign: 'center' }}>
          Choose products
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
              <ProductPreviewById key={item} id={item} api={props.api} />
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
        {/* On click - choose product */}
        <Button
          color="primary"
          variant="outlined"
          fullWidth
          css={{ marginTop: 10 }}
          onClick={() => {
            const close = appState.globalState.openDialog(
              <ProductPicker
                api={props.api}
                context={appState}
                omitIds={store.value}
                onChange={action(product => {
                  if (product) {
                    props.onChange([...(store.value || []), String(product.id)]);
                  }
                  close();
                })}
              />
            );
          }}
        >
          + Product
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

export function PickEcomProductsButton(props: Omit<PickEcomProductsListProps, 'onDone'>) {
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
                <PickEcomProductsList {...props} onDone={() => close()} />
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
