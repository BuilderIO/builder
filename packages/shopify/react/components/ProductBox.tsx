/**
 * IMPORTANT: THIS FILE IS DEPRECATED
 * use product-box.ts instead
 */

/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import styled from '@emotion/styled';
import { ShopifyProduct } from '../interfaces/shopify-product';
import React, { useEffect, useState } from 'react';
import { BuilderElement } from '@builder.io/sdk';
import {
  Builder,
  BuilderStore,
  BuilderStoreContext,
  BuilderBlockComponent,
} from '@builder.io/react';
import { modifyProduct } from '../functions/modify-product';

interface ProductBoxProps {
  product?: string | number;
  linkToProductPageOnClick?: boolean;
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

const Box = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
});

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

/**
 * @deprecated, use product-box.ts symbol instead
 */
export function ProductBox(props: ProductBoxProps) {
  let productId = props.product || '';
  const [productInfo, setProductInfo] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateProduct();
  }, [props.product]);

  function updateProduct() {
    const { context } = props.builderState!;

    if (productId) {
      setLoading(true);
      fetch(
        `https://cdn.builder.io/api/v1/shopify/products/${productId}.json?apiKey=${context.apiKey}`
      )
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

  function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!props.builderBlock?.component?.options?.linkToProductPageOnClick) {
      return;
    }
    if (!productInfo) {
      return;
    }
    if (e.defaultPrevented || Builder.isEditing) {
      return;
    }
    const url = `/products/${productInfo.handle}`;
    function goToProductPage() {
      location.href = url;
    }
    const { target, currentTarget } = e;
    if (target === currentTarget) {
      goToProductPage();
    }
    let current = target as HTMLElement | null;
    do {
      if (!current) {
        break;
      } else if (current === currentTarget) {
        goToProductPage();
      } else if (['SELECT', 'INPUT', 'FORM', 'BUTTON', 'A'].includes(current.tagName)) {
        break;
      }
    } while (current && (current = current.parentElement));
  }

  return Builder.isEditing && !productId ? (
    // TODO: <Info> component
    <div
      style={{
        padding: 20,
        opacity: 0.7,
        textAlign: 'center',
      }}
    >
      Double click to choose a product
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
          <Box
            css={props.linkToProductPageOnClick ? { cursor: 'pointer' } : undefined}
            onClick={onClick}
          >
            {props.builderBlock?.children?.map(item => (
              <BuilderBlockComponent block={item} key={item.id} />
            ))}
          </Box>
        </BuilderStoreContext.Provider>
      )}
    </BuilderStoreContext.Consumer>
  );
}

Builder.registerComponent(ProductBox, {
  name: 'Shopify:ProductBox',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2Fd4fb2d0e6f954b31b60f6f0573e91b0c%2Fff2fd04bad384f30837b40bda8a062dc',
  canHaveChildren: true,
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'product',
      type: 'ShopifyProduct',
    },
    {
      name: 'linkToProductPageOnClick',
      type: 'boolean',
      defaultValue: true,
    },
  ],
});
