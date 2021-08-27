import React, { useState, useEffect } from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { ProductsList } from '../components/ProductsList/ProductsList';
import { BuilderComponent, Builder } from '@builder.io/react';

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
    <div style={{ display: 'flex', flexDirection: 'column', padding: 50 }}>
      <div style={{ margin: '0 auto', maxWidth: 1200, width: '100%' }}>
        {product == null ? (
          <div
            style={{
              display: 'flex',
              padding: 100,
              justifyContent: 'center',
            }}
          >
            <CircularProgress disableShrink color="inherit" />
          </div>
        ) : product.errorCode ? (
          <div style={{ padding: 100, textAlign: 'center', color: '#666' }}>Product not found</div>
        ) : (
          <div>
            <div style={{ display: 'flex', position: 'relative', alignItems: 'flex-start' }}>
              <div style={{ width: '50%', flexShrink: 0, textAlign: 'center',  }}>
                {item.images
                .slice(0, props.size === 'small' ? 1 : 2).map(image => 
                  <img
                    style={{
                      display: 'block',
                      padding: 5,
                      objectFit: 'contain',
                      width: '100%',
                      maxHeight: 800,
                    }}
                    src={image.imageUrl}
                  />
                )}
              </div>
              <div style={{ marginLeft: 50, position: 'sticky', top: 50 }}>
                <h2>{item.name}</h2>
                <h3>${price}.00</h3>
                <p>{product.description}</p>
                <Button href={seller.addToCartLink} variant="outlined" size="large" style={{ marginTop: 10 }} fullWidth>
                  Add to bag
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Product() {
  return <BuilderComponent model="product-detail" />
}