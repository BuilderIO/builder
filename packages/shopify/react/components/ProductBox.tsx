/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';

import React, { useEffect, useState } from 'react';
import { Builder, BuilderElement } from '@builder.io/sdk';
import { BuilderStore, BuilderStoreContext, BuilderBlocks } from '@builder.io/react';
import { modifyProduct } from '../functions/modify-product';

interface ProductBoxProps {
  product?: string | number;
  /** @todo implement this */
  variant?: string | number;
  builderState?: BuilderStore;
  builderBlock?: BuilderElement;
}

const spin = keyframes`
  0% {
    transform:rotate(0)
  }
  100% {
    transform:rotate(360deg)
  }
`;

function LoadingSpinner() {
  return (
    <div
      css={css`
        width: 4em;
        height: 4em;
        border-radius: 50%;
        position: relative;
        margin: 6rem auto;
        font-size: 1rem;
        text-indent: -9999em;
        border-top: 0.2em solid rgba(131, 132, 137, 0.2);
        border-right: 0.2em solid rgba(131, 132, 137, 0.2);
        border-bottom: 0.2em solid rgba(131, 132, 137, 0.2);
        border-left: 0.2em solid #454749;
        transform: translateZ(0);
        animation: 1.1s linear infinite ${spin};
      `}
    />
  );
}

export function ProductBox(props: ProductBoxProps) {
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateProduct();
  }, [props.product]);

  function updateProduct() {
    setLoading(true);
    const { context } = props.builderState!;
    let productId = props.product || '';

    if (productId) {
      fetch(`https://builder.io/api/v1/shopify/products/${productId}.json?apiKey=${context.apiKey}`)
        .then(res => res.json())
        .then(data => {
          const { product } = data;
          const modifiedProduct = modifyProduct(product);
          setProductInfo(modifiedProduct);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching Shopify product', err);
          setLoading(false);
        });
    } else {
      setProductInfo(null);
    }
  }

  return loading && !productInfo ? (
    <LoadingSpinner />
  ) : (
    <BuilderStoreContext.Consumer>
      {store => (
        <BuilderStoreContext.Provider
          value={{
            ...store,
            state: {
              ...store.state,
              // TODO: communicate up this up to DataEditor to populate bindings dropdowns (how?)
              productInfo,
            },
          }}
        >
          <BuilderBlocks
            child
            parentElementId={props.builderBlock?.id}
            blocks={props.builderBlock?.children}
          />
        </BuilderStoreContext.Provider>
      )}
    </BuilderStoreContext.Consumer>
  );
}

Builder.registerComponent(ProductBox, {
  name: 'Shopify:ProductBox',
  canHaveChildren: true,
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'product',
      type: 'ShopifyProduct',
    },
  ],
});
