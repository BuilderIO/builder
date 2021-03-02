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
import { Create, Search, Sync } from '@material-ui/icons';
import { computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
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

@observer
export class ProductPreviewCell extends SafeComponent<EcomProductPreviewCellProps> {
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
export class ProductPicker extends SafeComponent<
  CustomReactEditorProps<EcomProduct> & { api: any }
> {
  @observable searchInputText = '';
  @observable loading = false;

  @observable products: EcomProduct[] = [];

  async searchProducts() {
    this.loading = true;

    const onEcomError = (err: any) => {
      console.error('Ecom product search error:', err);
      this.props.context.snackBar.show(
        'Oh no! There was an error syncing your page to Ecom. Please contact us for support'
      );
    };

    // const agent =
    // TODO: cancen pending requests if any
    const productsResponse = await this.props.api
      .searchProducts(this.searchInputText)
      .catch(onEcomError);

    runInAction(() => {
      if (Array.isArray(productsResponse)) {
        this.products = productsResponse;
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
                    this.props.onChange(item);
                  }}
                >
                  <ProductPreviewCell
                    selected={String(item.id) === String(this.props.value?.id)}
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
    );
  }
}

@observer
export class EcomProductPicker extends SafeComponent<EcomProductPickerProps> {
  @computed get loading() {
    return this.productInfoCacheValue?.loading;
  }

  @computed get productInfo() {
    return this.productHandle
      ? this.productInfoCacheValue?.value?.products?.[0]
      : this.productInfoCacheValue?.value?.product;
  }

  @computed get productInfoCacheValue() {
    const id = this.productId || this.productHandle;
    const apiKey = this.props.context.user.apiKey;
    if (!(apiKey && id)) {
      return null;
    }
    return this.productId
      ? this.props.api.getProductById(id)
      : this.props.api.getProductByHandle(id);
  }

  get productId() {
    if (this.props.handleOnly) {
      return '';
    }
    return typeof this.props.value === 'object'
      ? this.props.value?.options?.get('product')
      : this.props.value || '';
  }

  get productHandle() {
    return this.props.handleOnly && typeof this.props.value === 'string'
      ? this.props.value
      : undefined;
  }

  get pluginSettings() {
    return fastClone(
      this.props.context.user.organization?.value.settings.plugins.get(this.props.pluginId) || {}
    );
  }

  set productId(value) {
    if (this.props.handleOnly) {
      return;
    }
    if (this.props.field?.isTargeting) {
      this.props.onChange(value);
    } else {
      this.props.onChange(this.props.api.getRequestObject(value));
    }
  }

  set productHandle(value) {
    if (this.props.handleOnly) {
      this.props.onChange(value);
    }
  }

  async showChooseProductModal() {
    const close = await this.props.context.globalState.openDialog(
      <ProductPicker
        api={this.props.api}
        context={this.props.context}
        value={this.productInfo}
        onChange={value => {
          this.productHandle = value?.handle;
          this.productId = value?.id;
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
    const { apiKey, apiPassword } = this.pluginSettings;

    if (!(apiKey && apiPassword)) {
      return (
        <SetEcomKeysMessage pluginId={this.props.pluginId} pluginName={this.props.pluginName} />
      );
    }
    return (
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
              onClick={() => {
                this.showChooseProductModal();
              }}
            >
              <Create css={{ color: '#888' }} />
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
    );
  }
}
