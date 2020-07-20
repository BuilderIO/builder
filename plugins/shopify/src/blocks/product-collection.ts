import { el, mergeEl, _s } from '../modules/blocks';
import { BuilderElement } from '@builder.io/sdk';
import { loadingSpinner } from './loading-spinner';
import { productBoxBlock } from './product-info';

export const collectionGrid = el({
  layerName: 'Collection grid',
  responsiveStyles: {
    large: {
      // TODO: higher level options for grid vs scroller, etc
      flexDirection: 'row',
      // Ya? no?
      paddingRight: '20px',
      justifyContent: 'center',
      overflow: 'auto',
    },
  },
  component: {
    name: 'Symbol',
    options: {
      symbol: {
        inline: true,
        data: {
          type: 'grid',
        },
        content: {
          data: {
            // Compiler to allow function references (rollup?). How deref (tsCode = srcCode? or codebase?)
            jsCode: _s(
              (
                data: any,
                ref: any,
                state: any,
                update: any,
                element: any,
                Builder: any,
                builder: any,
                context: any
              ) => {
                let lastCollectionId = state.collection;

                if (Builder.isEditing) {
                  // TODO: ref.useEffect(() => ... , [])
                  ref.onStateChange.subscribe(() => {
                    if (lastCollectionId !== state.collection) {
                      updateCollection();
                      lastCollectionId = state.collection;
                    }
                  });
                }

                const wrapImage = (img: any) => ({
                  ...img,
                  toString() {
                    return img.src;
                  },
                  valueOf: () => img.src,
                  aspect_ratio: img.width / img.height,
                });

                /**
                 * Modify product JSON from Shopify APIs to behave more like liquid product objects
                 */
                // TODO: how code share this and stringify. Rolup .. ??
                function modifyProduct(product: any) {
                  product.images = product.images.map((item: any) => wrapImage(item));
                  product.featured_image = product.images[0];
                  product.variants.forEach(
                    (item: any) => (item.featured_image = product.featured_image)
                  );
                  product.description = product.body_html;
                  product.options_with_values = product.options;

                  const minPriceVariation = product.variants.reduce((current: any, item: any) => {
                    if (current === item) {
                      return current;
                    }
                    const currentMin = parseFloat(current.price);
                    const newMin = parseFloat(item.price);

                    return currentMin <= newMin ? current : item;
                  }, product.variants[0]);

                  // TODO: other currencies
                  product.price = minPriceVariation.price;

                  // TODO: price_min, price_max, price_varies, other properties
                  // here https://help.shopify.com/en/themes/liquid/objects/product#product-price
                  return product;
                }

                function updateCollection() {
                  if (state.collectionInfo && !state.collection) {
                    return;
                  }
                  const { collection } = state;
                  if (collection) {
                    state.loading = true;
                    fetch(
                      `https://cdn.builder.io/api/v1/shopify/products.json?apiKey=${context.apiKey}&collection_id=${collection}`
                    )
                      .then(res => res.json())
                      .then(data => {
                        const collection = data;
                        if (collection && collection.products) {
                          collection.products = collection.products.map((product: any) =>
                            modifyProduct(product)
                          );
                        }
                        state.collectionInfo = collection;
                        state.loading = false;
                      })
                      .catch(err => {
                        console.error('Error fetching Shopify product', err);
                        state.loading = false;
                      });
                  } else {
                    state.collectionInfo = null;
                  }
                }
                updateCollection();
              }
            ),
            inputs: [
              {
                '@type': '@builder.io/core:Field',
                name: 'collection',
                type: 'ShopifyCollection',
                required: true,
              },
              {
                '@type': '@builder.io/core:Field',
                name: 'type',
                type: 'text',
                defaultValue: 'grid',
                enum: ['grid', 'row'],
                required: true,
              },
            ],
            blocks: [
              el({
                layerLocked: true,
                bindings: {
                  show: _s((state: any) => !(state.collection || state.collectionInfo)),
                },
                responsiveStyles: {
                  large: {
                    padding: '20px',
                    opacity: '0.7',
                    textAlign: 'center',
                  },
                },
                component: {
                  name: 'Text',
                  options: {
                    text: 'Double click to choose a collection',
                  },
                },
              }),
              el({
                ...loadingSpinner,
                layerLocked: true,
                bindings: {
                  show: _s((state: any) => state.loading),
                },
              }),
              el({
                layerLocked: true,
                bindings: {
                  show: _s(
                    (state: any) =>
                      !state.collectionInfo &&
                      state.collectionInfo.products &&
                      !state.collectionInfo.products.length
                  ),
                },
                responsiveStyles: {
                  large: {
                    padding: '20px',
                    opacity: '0.7',
                    textAlign: 'center',
                  },
                },
                component: {
                  name: 'Text',
                  options: {
                    // For collection "name". Make our own proxy API that
                    // can return products and collection names?
                    text: 'No matching products',
                  },
                },
              }),
              el({
                layerName: 'Products container',
                responsiveStyles: {
                  large: {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  },
                },
                bindings: {
                  'style.flexWrap': _s((state: any) => {
                    const type = state.type;
                    return type === 'row' ? 'none' : 'wrap';
                  }),
                },
                children: [
                  mergeEl(productBoxBlock, {
                    responsiveStyles: {
                      large: {
                        width: '300px',
                      },
                    },
                    repeat: {
                      collection: 'collectionInfo.products',
                      itemName: 'product',
                    },
                    bindings: {
                      'component.options.symbol.data.productInfo': _s(
                        (state: any) => state.product
                      ),
                    },
                  }),
                ],
              }),
            ] as BuilderElement[],
          },
        },
      },
    },
  },
});
