import React from 'react';
import { ProductsList } from './ProductsList';
import { ProductsListBuilderConfig } from './ProductsList.builder';
import { getDefaultProps } from '@builder.io/storybook';

const props = getDefaultProps(ProductsListBuilderConfig);

export default {
  title: 'Products List',
  component: ProductsList,
};

export const DefaultProductsList = () => <ProductsList {...props}></ProductsList>;
