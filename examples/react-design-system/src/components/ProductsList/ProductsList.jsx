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
  abbreviatedCategoryHistogram: true,
  limit: 20,
  cat: 'womens-fashion',
  view: 'web',
  useElasticsearch: true,
  sorts: 'Popular',
  pid: 'shopstyle',
};

export const ProductsList = props => {
  const { amount, category, size } = props;
  const url = 'https://api.shopstyle.com/api/v2/products';
  const [data, setData] = useState({ products: [] });
  const classes = useStyles();
  useEffect(() => {
    async function fetchProducts() {
      const qs = queryString.stringify({
        ...defaultParams,
        limit: amount || defaultParams.limit,
        cat: category || defaultParams.cat,
      });
      const result = await fetch(`${url}?${qs}`).then(res => res.json());
      setData(result);
    }
    fetchProducts();
  }, [amount, category, url]);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {data.products.map(product => (
          <Product key={product.id} sizeName={size || 'Medium'} {...product} />
        ))}
      </div>
    </div>
  );
};
