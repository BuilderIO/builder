import { keyframes } from '@emotion/core';

import { el, mergeEl, _s } from '../modules/blocks';
import { BuilderElement } from '@builder.io/sdk';
import { fastClone } from '../functions/fast-clone';

const spinKeyframes = keyframes({
  '0%': {
    transform: 'rotate(0)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

const loadingSpinner = el({
  layerName: 'Loading spinner',
  layerLocked: true,
  responsiveStyles: {
    large: {
      width: '4em',
      height: '4em',
      borderRadius: '50%',
      position: 'relative',
      margin: '6rem auto',
      fontSize: '1rem',
      textIndent: '-9999em',
      borderTop: '0.2em solid rgba(131, 132, 137, 0.2)',
      borderRight: '0.2em solid rgba(131, 132, 137, 0.2)',
      borderBottom: '0.2em solid rgba(131, 132, 137, 0.2)',
      borderLeft: '0.2em solid #454749',
      transform: 'translateZ(0)',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'inear',
      animationDuration: '1.1s',
      animationName: spinKeyframes.toString(),
    },
  },
});

export const productBoxWithChildren = (children: Partial<BuilderElement>[]) => {
  const cloned = fastClone(productBox);
  cloned.component.options.symbol.content.data.blocks = [
    ...cloned.component.options.symbol.content.data.blocks,
    ...children,
  ];
  return cloned;
};

export const productBox = el({
  layerName: 'Product Box',
  meta: {
    kind: 'ProductBox',
  },
  bindings: {
    'style.cursor': _s((state, block) =>
      block?.component?.options?.linkToProductPageOnClick !== false ? 'pointer' : undefined
    ),
    'component.options.symbol.data.linkToProductPageOnClick': _s(
      (state, block) => block?.component?.options?.linkToProductPageOnClick
    ),
  },
  responsiveStyles: {
    large: { minHeight: '200px', marginLeft: '15px', marginRight: '15px' },
  },
  actions: {
    click: _s((state, event: MouseEvent, block, ref, Builder) => {}),
  },
  component: {
    name: 'Symbol',
    options: {
      symbol: {
        data: {
          loading: false,
          product: '',
          linkToProductPageOnClick: true,
        },
        inline: true,
        content: {
          data: {
            inputs: [
              {
                '@type': '@builder.io/core:Field',
                name: 'product',
                type: 'ShopifyProduct',
              },
              {
                '@type': '@builder.io/core:Field',
                name: 'linkToProductPageOnClick',
                type: 'boolean',
                defaultValue: true,
              },
            ],
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
                let lastPorductId = state.product;

                if (Builder.isEditing) {
                  // TODO: ref.useEffect(() => ... , [])
                  ref.onStateChange.subscribe(() => {
                    if (lastPorductId !== state.product) {
                      updateProduct();
                      lastPorductId = state.product;
                    }
                  });
                }

                ref.element.addEventListener('click', (event: MouseEvent) => {
                  if (state.linkToProductPageOnClick === false) {
                    return;
                  }
                  if (event.defaultPrevented || Builder.isEditing) {
                    return;
                  }

                  const productInfo = state.productInfo;
                  if (!productInfo) {
                    return;
                  }
                  const url = `/products/${productInfo.handle}`;
                  function goToProductPage() {
                    window.location.href = url;
                  }
                  const { target, currentTarget } = event;
                  if (target === currentTarget) {
                    goToProductPage();
                  }
                  let current = target as HTMLElement | null;
                  do {
                    if (!current) {
                      break;
                    } else if (current === currentTarget) {
                      goToProductPage();
                      break;
                    } else if (['SELECT', 'INPUT', 'BUTTON', 'A'].includes(current.tagName)) {
                      break;
                    }
                  } while (current && (current = current.parentElement));
                });

                function wrapImage(img: any) {
                  return {
                    ...img,
                    toString() {
                      return img.src;
                    },
                    valueOf: () => img.src,
                    aspect_ratio: img.width / img.height,
                  };
                }

                /**
                 * Modify product JSON from Shopify APIs to behave more like liquid product objects
                 */
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

                function updateProduct() {
                  if (state.productInfo && !state.product) {
                    return;
                  }
                  const { product } = state;
                  if (product) {
                    state.loading = true;
                    fetch(
                      `https://cdn.builder.io/api/v1/shopify/products/${product}.json?apiKey=${context.apiKey}`
                    )
                      .then(res => res.json())
                      .then(data => {
                        const { product } = data;
                        if (product) {
                          const modifiedProduct = modifyProduct(product);
                          state.productInfo = modifiedProduct;
                        }
                        state.loading = false;
                      })
                      .catch(err => {
                        console.error('Error fetching Shopify product', err);
                        state.loading = false;
                      });
                  } else {
                    state.productInfo = null;
                  }
                }
                updateProduct();
              }
            ),
            blocks: [
              el({
                layerLocked: true,
                bindings: {
                  show: _s((state: any) => !(state.product || state.productInfo)),
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
                    text: 'Double click to choose a product',
                  },
                },
              }),
              mergeEl(loadingSpinner, {
                bindings: {
                  show: _s((state: any) => state.loading && !state.productInfo),
                },
              }),
            ],
          },
        },
      },
    },
  },
});
