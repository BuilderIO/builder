import React, { useState, useEffect } from 'react';
import { Product } from '../Product/Product';
import { makeStyles } from '@material-ui/core/styles';

const VTEX_API_TOKEN = 'OYJEGVWPBKLSHPZIVLQVZVYKNBGEQRZFPTULIDCFXZPOQBZZMBGXKGOTAYREPSZKLGCOVOASJKXAGKULCGSOLCVIEAKKLXQFAFDKZKEXBNNZJNMQEGCJZKYIKTJUEPGM'
const VTEX_APP_KEY = 'vtexappkey-schneiderinternal-GCKAEM'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

export const ProductsList = props => {
  const { amount, category, size } = props;
  const url = 'https://schneiderinternal.myvtex.com/api/catalog_system/pub/products/search';
  const [data, setData] = useState([]);
  const classes = useStyles();
  useEffect(() => {
    async function fetchProducts() {
      const result = await fetch(`https://builder.io/api/v1/proxy-api?url=${encodeURIComponent(`${url}/${encodeURI(category || 'charm')}`)}&v=2`, {
        headers: {
          'X-VTEX-API-AppKey': VTEX_APP_KEY,
          'X-VTEX-API-AppToken': VTEX_API_TOKEN
        }
      }).then(res => res.json());
      setData(result);
    }
    fetchProducts();
  }, [category, url]);

  return (
    <div className={classes.root}>
      <div style={{ border: '0.5px solid #eaeef5' }} className={classes.container}>
        {data.slice(0, amount || 20).map(product => (
          <Product key={product.productId} sizeName={size || 'Medium'} {...product} />
        ))}
      </div>
    </div>
  );
};
