import React, { useState, useEffect } from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { ProductsList } from '../components/ProductsList/ProductsList';
import { BuilderComponent, Builder } from '@builder.io/react';
import { ProductInfoContent } from './ProductInfoContent';

const VTEX_API_TOKEN = 'OYJEGVWPBKLSHPZIVLQVZVYKNBGEQRZFPTULIDCFXZPOQBZZMBGXKGOTAYREPSZKLGCOVOASJKXAGKULCGSOLCVIEAKKLXQFAFDKZKEXBNNZJNMQEGCJZKYIKTJUEPGM'
const VTEX_APP_KEY = 'vtexappkey-schneiderinternal-GCKAEM'

Builder.registerComponent(ProductInfo, {
  name: 'Product Info',
  inputs: [
    {
      name: 'product',
      type: 'VtexProduct',
    },
    {
      name: 'size',
      type: 'string',
      defaultValue: 'small',
      enum: [
        'small',
        'large'
      ]
    }
  ]
})

function ProductInfo(props) {
  const id = props.product?.options?.product || window.location.pathname.split('/')[2];

  const [product, setProduct] = useState(null);
  useEffect(() => {
    const url = `https://schneiderinternal.myvtex.com/api/catalog_system/pub/products/search?fq=productId:${id}`;
    if (product !== null) {
      setProduct(null);
    }
    async function fetchProduct() {
      const result = await fetch(`https://builder.io/api/v1/proxy-api?url=${encodeURIComponent(url)}&v=2`, {
        headers: {
          'X-VTEX-API-AppKey': VTEX_APP_KEY,
          'X-VTEX-API-AppToken': VTEX_API_TOKEN
        }
      }).then(res => res.json());
      setProduct(result?.[0]);
    }
    fetchProduct();
  }, [id]);

  const item = product?.items?.[0];
  const seller = item?.sellers?.[0];
  const price = seller?.commertialOffer?.Price;

  return (
    product == null ? (
      <div
        style={{
          display: 'flex',
          padding: 100,
          justifyContent: 'center',
        }}
      >
        <CircularProgress disableShrink color="inherit" />
      </div>
    ): <ProductInfoContent product={product} item={item} seller={seller} price={price} />
  )
}

export function Product() {
  return <BuilderComponent model="product-detail" />
}