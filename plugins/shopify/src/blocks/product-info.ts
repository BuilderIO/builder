import { productBoxWithChildren } from './product-box';
import { el, _s } from '../modules/blocks';
import { Builder } from '@builder.io/sdk';

// TODO: unit tests for these with <Buildercomponent content={productTitle} /> etc
// TODO: put this in @builder.io/shopify?
export const productTitle = el(
  {
    layerName: 'Product Title',
    responsiveStyles: { large: { fontWeight: 'bold' } },
    bindings: {
      'component.options.text': 'productInfo.title',
      show: _s(state => state.productInfo),
    },
    component: { name: 'Text' },
  },
  true
);

export const productImage = el(
  {
    layerName: 'Product Image',
    bindings: {
      show: _s(state => state.productInfo),
      'component.options.image': 'productInfo.image.src',
      'component.options.srcset': _s(state => {
        const url = state.productInfo && state.productInfo.image && state.productInfo.image.src;
        if (!url) {
          return '';
        }
        const sizes = [100, 200, 400, 800, 1200, 1600, 2000];

        return sizes.map(size => `${url.replace('.jpg?', `_${size}x.jpg?`)} ${size}w`).join(', ');
      }),
      'component.options.altText': 'productInfo.image.alt || productInfo.title',
    },
    responsiveStyles: {
      large: {
        maxWidth: '800px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    component: {
      name: 'Image',
      options: {
        aspectRatio: 1,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      },
    },
  },
  true
);

// TODO: min and max price
export const productPrice = el(
  {
    layerName: 'Product price',
    bindings: {
      show: _s(state => state.productInfo),
      'component.options.text': _s(state => state.productInfo && `$${state.productInfo!.price}`),
    },
    component: { name: 'Text' },
  },
  true
);

export const productVariants = el(
  {
    layerName: 'Product Variants',
    bindings: {
      show: _s(state => state.productInfo),
      value: _s(state => state.selectedProductVariant || undefined),
      'component.options.options': _s(
        state =>
          state.productInfo &&
          state.productInfo.variants &&
          state.productInfo.variants.map((item: any) => ({
            name: item.title,
            value: item.id,
          }))
      ),
    },
    actions: {
      change: _s((state, event) => {
        state.selectedProductVariant =
          parseFloat((event.target as HTMLInputElement).value!) || undefined;
        const variant =
          state.productInfo &&
          state.productInfo.variants.find((item: any) => item.id === state.selectedProductVariant);
        if (variant) {
          state.productInfo!.price = variant.price;
        }
        const firstMatchingImage = state.productInfo!.images.find((item: any) =>
          item.variant_ids.includes(state.selectedProductVariant)
        );
        if (firstMatchingImage) {
          state.productInfo!.image = firstMatchingImage;
        }
      }),
    },
    component: {
      name: 'Form:Select',
    },
  },
  true
);

// TODO: component w/ form (?)
export const addToCart = el(
  {
    layerName: 'Add to cart button',
    tagName: 'a',
    responsiveStyles: {
      large: {
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: 'black',
        color: 'white',
      },
    },
    bindings: {
      show: _s(state => state.productInfo),
    },
    actions: {
      click: _s(
        (state, event: MouseEvent, block, builder: Builder, _, update, _Builder, context) => {
          if (event.defaultPrevented) {
            return;
          }

          const content = context.builerContent;
          const id = content && content.id;
          const variationId =
            content && (content.id || content.variationId || content.testVariationId);

          // TODO: proxy this....
          fetch('/cart/add.js', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              items: [
                {
                  quantity: 1,
                  id:
                    state.selectedProductVariant ||
                    (state.productInfo!.variants &&
                      state.productInfo!.variants[0] &&
                      state.productInfo!.variants[0].id),
                },
              ],
            }),
          })
            .then(res => {
              window.location.href = '/cart';
            })
            .catch(error => {
              // TODO: monitor this
              console.error('Add to cart fetch error', error);
            });

          if (!(Builder.isEditing || (Builder as any).isPreviewing)) {
            builder.track('addToCart', {
              variationId,
              contentId: id,
              // TODO: price
              amount:
                (state.productInfo &&
                  state.productInfo.price &&
                  parseFloat(state.productInfo.price)) ||
                0,
            });
          }

          // 30 days from now
          const future = new Date();
          future.setDate(future.getDate() + 30);
          (builder as any).setCookie(
            'builder.addToCart.' + state.product,
            [id, variationId].join(','),
            future
          );
        }
      ),
    },
    // TODO: init code that runs on startup taht can listen to not available and override stuff
    // liek make button disabled
    component: {
      name: 'Text',
      options: {
        text: 'Add to cart',
      },
    },
  },
  true
);

export const productBoxBlock = productBoxWithChildren([
  productImage,
  productTitle,
  productPrice,
  productVariants,
  addToCart,
]);
