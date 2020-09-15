import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { Product } from '../Product/Product';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
}));

const defaultParams = {
  limit: 20,
  cat: 'womens-clothes',
  view: 'web',
  pid: 'shopstyle',
};

/**
 * This component renders remove data serverside. See ./ProductsListWithServerSideData.builder.js
 * for more info on how
 */
export const ProductsListWithServerSideData = props => {
  const { url: urlProp, amount, category, size, products } = props;
  const url = urlProp || 'https://api.shopstyle.com/api/v2/products';
  const [data, setData] = useState({ products: [] });
  const classes = useStyles();
  useEffect(() => {
    // If products were requested for us, use it
    // Otherwise, fetch client side (e.g. for editing, or using this component
    // without Builder.io server side requests)
    if (products?.data?.products) {
      return;
    }
    // Request client side when editing or props change
    async function fetchProducts() {
      const qs = queryString.stringify({
        ...defaultParams,
        limit: amount,
        cat: category,
      });
      const result = await fetch(`${url}?${qs}`).then(res => res.json());
      setData(result);
    }
    fetchProducts();
  }, [amount, category, url, products]);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* use products if supplied, otherwise fetch it */}
        {(products?.data?.products || data.products).map(product => (
          <Product key={product.id} sizeName={size} {...product} />
        ))}
      </div>
    </div>
  );
};
