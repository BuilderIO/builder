import React from 'react';
import { SafeComponent } from '../../classes/safe-component.class';
import { observer } from 'mobx-react';
import { CustomReactEditorProps } from '../../components/FieldsForm';
import { computed, observable, reaction, runInAction } from 'mobx';
import {
  Button,
  TextField,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from '@material-ui/core';
import { appState } from '../../constants/app-state.constant';
import { ShopifyProduct } from '../interfaces/shopify-product';
import { isDev } from '../../constants/environment.constant';
import { reportException } from '../../functions/report-exception';
import { Builder } from '@builder.io/react';
import { nextTick } from '../../functions/next-tick.function';
import { Create, Search } from '@material-ui/icons';
import { theme } from '../../constants/theme.constant';

nextTick(() => {
  reaction(
    () => appState.user.isShopify,
    isShopify => {
      if (isShopify) {
        Builder.registerEditor({
          name: 'ShopifyProduct',
          component: ShopifyProductPicker,
        });
      } else {
        const index = Builder.editors.findIndex(item => item.name === 'ShopifyProduct');
        if (index !== -1) {
          Builder.editors.splice(index, 1);
        }
      }
    },
    {
      fireImmediately: true,
    }
  );
});

const apiRoot = isDev ? 'http://localhost:5000' : 'https://builder.io';

interface ShopifyProductPickerProps extends CustomReactEditorProps<string> {}

interface ShopifyProductPreviewCellProps {
  product: ShopifyProduct;
  button?: boolean;
  selected?: boolean;
  className?: string;
}

@observer
export class ProductPreviewCell extends SafeComponent<ShopifyProductPreviewCellProps> {
  render() {
    return (
      <ListItem
        className={this.props.className}
        button={this.props.button}
        selected={this.props.selected}
      >
        {this.props.product.image && (
          <ListItemAvatar>
            <Avatar css={{ borderRadius: 4 }} src={this.props.product.image.src} />
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
              {this.props.product.title}
            </div>
          }
        />
      </ListItem>
    );
  }
}

@observer
export class ProductPicker extends SafeComponent<ShopifyProductPickerProps> {
  @observable searchInputText = '';
  @observable loading = false;

  @observable products: ShopifyProduct[] = [];

  async searchProducts() {
    this.loading = true;
    const shopifyProductsUrl = apiRoot + '/api/v1/shopify/products.json';

    const onShopifyError = (err: any) => {
      console.error('Shopify product search error:', err);
      reportException(err);
      appState.snackBar.show(
        'Oh no! There was an error syncing your page to Shopify. Please contact us for support'
      );
    };

    // const agent =
    // TODO: cancen pending requests if any
    const productsResponse = await fetch(
      `${shopifyProductsUrl}?apiKey=${appState.user.apiKey}&title=${encodeURIComponent(
        this.searchInputText
      )}&limit=40`
    )
      .then(res => res.json())
      .catch(onShopifyError);

    runInAction(() => {
      if (productsResponse) {
        this.products = productsResponse.products;
      }
      this.loading = false;
    });
  }

  componentDidMount() {
    this.safeReaction(
      () => this.searchInputText,
      () => this.searchProducts(),
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
          placeholder="Search products..."
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
            (this.products.length ? (
              this.products.map(item => (
                <div
                  key={item.id}
                  onClick={e => {
                    this.props.onChange(String(item.id));
                  }}
                >
                  <ProductPreviewCell
                    selected={String(item.id) === this.props.value}
                    button
                    product={item}
                    key={item.id}
                  />
                </div>
              ))
            ) : (
              <div>
                <Typography
                  css={{ margin: '40px 20px', textAlign: 'center', fontSize: 17 }}
                  variant="caption"
                >
                  No products found
                </Typography>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

@observer
export class ShopifyProductPicker extends SafeComponent<ShopifyProductPickerProps> {
  @computed get loading() {
    return this.productInfoCacheValue?.loading;
  }

  @computed get productInfo() {
    return this.productInfoCacheValue?.value?.product;
  }

  @computed get productInfoCacheValue() {
    if (!(appState.user.apiKey && this.value)) {
      return null;
    }
    return appState.httpCache.get<{ product: ShopifyProduct }>(
      `${apiRoot}/api/v1/shopify/products/${this.value}.json?apiKey=${appState.user.apiKey}`
    );
  }

  get value() {
    return this.props.value;
  }

  set value(value) {
    this.props.onChange(value);
  }

  async getProduct(id: string) {
    return null;
  }

  async showChooseProductModal() {
    const close = await appState.globalState.openDialog(
      <ProductPicker
        value={this.value}
        onChange={value => {
          console.log('onchange', value);
          this.props.onChange(value);
          close();
        }}
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
  }

  render() {
    return (
      <>
        <div css={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
          {this.productInfoCacheValue?.loading && (
            <CircularProgress size={20} disableShrink css={{ margin: '30px auto' }} />
          )}
          {this.productInfo && (
            <Paper
              css={{
                marginBottom: 15,
                position: 'relative',
              }}
              onClick={() => {
                this.showChooseProductModal();
              }}
            >
              <ProductPreviewCell button css={{ paddingRight: 30 }} product={this.productInfo} />
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
                <Create css={{ color: theme.colors.primary }} />
              </IconButton>
            </Paper>
          )}
          {!this.productInfo && (
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                this.showChooseProductModal();
              }}
            >
              Choose product
            </Button>
          )}
        </div>
      </>
    );
  }
}
