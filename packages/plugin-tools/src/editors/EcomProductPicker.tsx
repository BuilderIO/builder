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
import { SafeComponent } from '../components/safe-component';
import { CustomReactEditorProps } from '../interfaces/custom-react-editor-props';
import { EcomProduct } from '../interfaces/ecom-product';
import { BuilderRequest } from '../interfaces/builder-request';
import { fastClone } from '../functions/fast-clone';
import { SetEcomKeysMessage } from '../components/set-keys-message';

export interface EcomProductPickerProps extends CustomReactEditorProps<BuilderRequest | string> {
  isPreview?: boolean;
  handleOnly?: boolean;
  api: any;
  pluginId: string;
  pluginName: string;
}

export interface EcomProductPreviewCellProps {
  product: EcomProduct;
  button?: boolean;
  selected?: boolean;
  className?: string;
}

export const ProductPreviewCell: React.FC<EcomProductPreviewCellProps> = props =>
  useObserver(() => (
    <ListItem className={props.className} button={props.button} selected={props.selected}>
      {props.product.image && (
        <ListItemAvatar>
          <Avatar css={{ borderRadius: 4 }} src={props.product.image.src} />
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
            {props.product.title}
          </div>
        }
      />
    </ListItem>
  ));

export const ProductPicker: React.FC<
  CustomReactEditorProps<EcomProduct> & { api: any; omitIds?: string[] }
> = props => {
  const store = useLocalStore(() => ({
    searchInputText: '',
    loading: false,
    products: [] as EcomProduct[],
    async searchProducts() {
      this.loading = true;
      const onEcomError = (err: any) => {
        console.error('Ecom product search error:', err);
        props.context.snackBar.show('Oh no! There was an error searching for products');
      };

      const productsResponse = await props.api
        .searchProducts(store.searchInputText)
        .catch(onEcomError);

      runInAction(() => {
        if (Array.isArray(productsResponse)) {
          this.products = productsResponse.filter(
            product => !(props.omitIds || []).includes(product.id)
          );
        }
        this.loading = false;
      });
    },
  }));

  useEffect(() => {
    store.searchProducts();
  }, [store.searchInputText]);

  return useObserver(() => (
    <div css={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
      <TextField
        css={{ margin: 15 }}
        value={store.searchInputText}
        placeholder="Search products..."
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
          (store.products.length ? (
            store.products.map(item => (
              <div
                key={item.id}
                onClick={e => {
                  props.onChange(item);
                }}
              >
                <ProductPreviewCell
                  selected={String(item.id) === String(props.value?.id)}
                  button
                  product={item}
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
                No products found
              </Typography>
            </div>
          ))}
      </div>
    </div>
  ));
};

export const EcomProductPicker: React.FC<EcomProductPickerProps> = props => {
  const store = useLocalStore(() => ({
    loading: false,
    productInfo: null as EcomProduct | null,
    productHandle: props.handleOnly && typeof props.value === 'string' ? props.value : undefined,
    productId: props.handleOnly && typeof props.value === 'string' ? props.value : undefined,
    async getProduct() {
      this.loading = true;
      try {
        const value =
          (this.productId && (await props.api.getProductById(this.productId))) ||
          (this.productHandle && (await props.api.getProductByHandle(this.productHandle)));
        this.productInfo = value;
      } catch (e) {
        console.error(e);
        props.context.snackBar.show('Oh no! There was an error fetching product');
      }
      this.loading = false;
    },
    async showChooseProductModal() {
      const close = await props.context.globalState.openDialog(
        <ProductPicker
          api={props.api}
          context={props.context}
          {...(this.productInfo && { value: this.productInfo })}
          onChange={action(value => {
            if (value) {
              this.productHandle = value.handle;
              this.productId = String(value.id);
              this.getProduct();
              if (props.handleOnly) {
                props.onChange(this.productHandle);
              } else {
                if (props.field?.isTargeting) {
                  props.onChange(this.productId);
                } else {
                  props.onChange(props.api.getRequestObject(this.productId));
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
            // grows and shrinks to show more/less products or loading
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
        {store.productInfo && (
          <Paper
            css={{
              marginBottom: 15,
              position: 'relative',
            }}
          >
            <ProductPreviewCell button css={{ paddingRight: 30 }} product={store.productInfo} />
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
                store.showChooseProductModal();
              }}
            >
              <Create css={{ color: '#888' }} />
            </IconButton>
          </Paper>
        )}
        {!store.productInfo && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              store.showChooseProductModal();
            }}
          >
            Choose product
          </Button>
        )}
      </div>
    );
  });
};
