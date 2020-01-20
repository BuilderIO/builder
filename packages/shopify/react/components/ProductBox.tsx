import React, { useEffect, useState } from 'react';
import { Builder } from '@builder.io/sdk';
import { BuilderStore, BuilderStoreContext } from '@builder.io/react';

interface ProductBoxProps {
  product?: string | number;
  /** @todo implement this */
  variant?: string | number;
  builderState?: BuilderStore;
  children?: any;
}

export function ProductBox(props: ProductBoxProps) {
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    updateProduct();
  }, [props.product]);

  function updateProduct() {
    const { context } = props.builderState!;
    let productId = props.product || '';

    if (productId) {
      fetch(`https://builder.io/api/v1/shopify/products/${productId}.json?apiKey=${context.apiKey}`)
        .then(res => res.json())
        .then(data => {
          setProductInfo(data.product);
        });
    } else {
      setProductInfo(null);
    }
  }

  return (
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
          {props.children}
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
