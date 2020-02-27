/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Builder } from '@builder.io/react'
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
  Typography
} from '@material-ui/core'
import { Create, Search } from '@material-ui/icons'
import { computed, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { SafeComponent } from '../components/safe-component'
import { CustomReactEditorProps } from '../interfaces/custom-react-editor-props'
import { ShopifyProduct } from '../interfaces/shopify-product'
import { BuilderRequest } from '../interfaces/builder-request'
import { fastClone } from '../functions/fast-clone'
import { SetShopifyKeysMessage } from '../components/set-shopify-keys-message'

const apiRoot = 'https://qa.builder.io' // 'https://builder.io'

interface ShopifyProductPickerProps
  extends CustomReactEditorProps<BuilderRequest> {}

interface ShopifyProductPreviewCellProps {
  product: ShopifyProduct
  button?: boolean
  selected?: boolean
  className?: string
}

@observer
export class ProductPreviewCell extends SafeComponent<
  ShopifyProductPreviewCellProps
> {
  render() {
    return (
      <ListItem
        className={this.props.className}
        button={this.props.button}
        selected={this.props.selected}
      >
        {this.props.product.image && (
          <ListItemAvatar>
            <Avatar
              css={{ borderRadius: 4 }}
              src={this.props.product.image.src}
            />
          </ListItemAvatar>
        )}
        <ListItemText
          primary={
            <div
              css={{
                maxWidth: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {this.props.product.title}
            </div>
          }
        />
      </ListItem>
    )
  }
}

@observer
export class ProductPicker extends SafeComponent<
  CustomReactEditorProps<string>
> {
  @observable searchInputText = ''
  @observable loading = false

  @observable products: ShopifyProduct[] = []

  async searchProducts() {
    this.loading = true
    const shopifyProductsUrl = apiRoot + '/api/v1/shopify/products.json'

    const onShopifyError = (err: any) => {
      console.error('Shopify product search error:', err)
      this.props.context.snackBar.show(
        'Oh no! There was an error syncing your page to Shopify. Please contact us for support'
      )
    }

    // const agent =
    // TODO: cancen pending requests if any
    const productsResponse = await fetch(
      `${shopifyProductsUrl}?apiKey=${
        this.props.context.user.apiKey
      }&title=${encodeURIComponent(this.searchInputText)}&limit=40`
    )
      .then(async res => {
        if (!res.ok) {
          onShopifyError(await res.text())
        }
        return res
      })
      .then(res => res && res.json())
      .catch(onShopifyError)

    runInAction(() => {
      if (productsResponse) {
        this.products = productsResponse.products
      }
      this.loading = false
    })
  }

  componentDidMount() {
    this.safeReaction(
      () => this.searchInputText,
      () => this.searchProducts(),
      {
        delay: 500,
        fireImmediately: true
      }
    )
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
                <Search
                  css={{ color: '#999', marginRight: -2, fontSize: 20 }}
                />
              </InputAdornment>
            )
          }}
          onChange={e => (this.searchInputText = e.target.value)}
        />
        {this.loading && (
          <CircularProgress disableShrink css={{ margin: '50px auto' }} />
        )}
        <div css={{ maxHeight: '80vh', overflow: 'auto' }}>
          {!this.loading &&
            (this.products.length ? (
              this.products.map(item => (
                <div
                  key={item.id}
                  onClick={e => {
                    this.props.onChange(String(item.id))
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
                  css={{
                    margin: '40px 20px',
                    textAlign: 'center',
                    fontSize: 17
                  }}
                  variant="caption"
                >
                  No products found
                </Typography>
              </div>
            ))}
        </div>
      </div>
    )
  }
}

@observer
export class ShopifyProductPicker extends SafeComponent<
  ShopifyProductPickerProps
> {
  @computed get loading() {
    return this.productInfoCacheValue?.loading
  }

  @computed get productInfo() {
    return this.productInfoCacheValue?.value?.product
  }

  @computed get productInfoCacheValue() {
    if (!(this.props.context.user.apiKey && this.productId)) {
      return null
    }
    return this.props.context.httpCache.get(
      `${apiRoot}/api/v1/shopify/products/${this.productId}.json?apiKey=${this.props.context.user.apiKey}`
    )
  }

  get productId() {
    return this.props.value?.options?.get('product') || ''
  }

  get pluginSettings() {
    return fastClone(
      this.props.context.user.organization?.value.settings.plugins.get(
        '@builder.io/plugin-shopify'
      ) || {}
    )
  }

  getRequestObject(productId: string) {
    // setting a Request object as the value, Builder.io will fetch the given URL
    // and populate that as the `data` property on this object in the return repsonse
    // from the API
    return {
      '@type': '@builder.io/core:Request',
      request: {
        url: `${apiRoot}/api/v1/shopify/products/{{this.options.product}}.json?apiKey=${this.props.context.user.apiKey}`
      },
      options: {
        product: productId
      }
    } as BuilderRequest
  }

  set productId(value) {
    this.props.onChange(this.getRequestObject(value))
  }

  async getProduct(id: string) {
    return null
  }

  async showChooseProductModal() {
    const close = await this.props.context.globalState.openDialog(
      <ProductPicker
        context={this.props.context}
        value={this.productId}
        onChange={value => {
          this.productId = value
          close()
        }}
      />,
      true,
      {
        PaperProps: {
          // Align modal to top so doesn't jump around centering itself when
          // grows and shrinks to show more/less products or loading
          style: {
            alignSelf: 'flex-start'
          }
        }
      }
    )
  }

  render() {
    const { apiKey, apiPassword } = this.pluginSettings

    if (!(apiKey && apiPassword)) {
      return <SetShopifyKeysMessage />
    }
    return (
      <div
        css={{ display: 'flex', flexDirection: 'column', padding: '10px 0' }}
      >
        {this.productInfoCacheValue?.loading && (
          <CircularProgress
            size={20}
            disableShrink
            css={{ margin: '30px auto' }}
          />
        )}
        {this.productInfo && (
          <Paper
            css={{
              marginBottom: 15,
              position: 'relative'
            }}
            onClick={() => {
              this.showChooseProductModal()
            }}
          >
            <ProductPreviewCell
              button
              css={{ paddingRight: 30 }}
              product={this.productInfo}
            />
            <IconButton
              css={{
                position: 'absolute',
                right: 2,
                top: 0,
                bottom: 0,
                height: 50,
                marginTop: 'auto',
                marginBottom: 'auto'
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
              this.showChooseProductModal()
            }}
          >
            Choose product
          </Button>
        )}
      </div>
    )
  }
}

Builder.registerEditor({
  name: 'ShopifyProduct',
  component: ShopifyProductPicker
})
