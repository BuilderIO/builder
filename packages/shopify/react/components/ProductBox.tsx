/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import styled from '@emotion/styled';

import React, { useEffect, useState } from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { Builder, BuilderStore, BuilderStoreContext, BuilderBlockComponent } from '@builder.io/react';
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

const LoadingSpinner = styled.div`
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
`;

export function ProductBox(props: ProductBoxProps) {
  let productId = props.product || '';
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateProduct();
  }, [props.product]);

  function updateProduct() {
    const { context } = props.builderState!;

    if (productId) {
      setLoading(true);
      fetch(`https://builder.io/api/v1/shopify/products/${productId}.json?apiKey=${context.apiKey}`)
        .then(res => res.json())
        .then(data => {
          const { product } = data;
          if (product) {
            const modifiedProduct = modifyProduct(product);
            setProductInfo(modifiedProduct);
          }
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

  return Builder.isEditing && !productId ? (
    // TODO: <Info> component
    <div
      css={{
        padding: 20,
        opacity: 0.7,
        textAlign: 'center',
      }}
    >
      Click to choose a product
    </div>
  ) : loading && !productInfo ? (
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
          {props.builderBlock?.children?.map(item => (
            <BuilderBlockComponent block={item} key={item.id} />
          ))}
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
