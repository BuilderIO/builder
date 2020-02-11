import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { Product } from '../Product/Product';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
}));

const defaultParams = {
  abbreviatedCategoryHistogram: true,
  limit: 20,
  cat: 'mens',
  view: 'web',
  useElasticsearch: true,
  sorts: 'PriceHiLo',
  pid: 'shopstyle',
};

export const ProductsList = props => {
  const { url, limit, category, spacing, columns, image } = props;
  const [data, setData] = useState({ products: [] });
  const classes = useStyles();
  useEffect(() => {
    async function fetchProducts() {
      const qs = queryString.stringify({
        ...defaultParams,
        limit,
        cat: category,
      });
      const result = await fetch(`${url}?${qs}`).then(res => res.json());
      setData(result);
    }
    fetchProducts();
  }, [limit, category, url]);

  return (
    <div className={classes.root}>
      <Grid container spacing={spacing}>
        {data.products.map(product => (
          <Grid key={product.id} item md={12 / columns} sm={12 / (columns / 2)}>
            <Product sizeName={image} {...product} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
