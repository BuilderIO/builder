import React from 'react';
import { ProductsList } from './ProductsList';
import { ProductsListBuilderConfig } from './ProductsList.builder';
import { transformConfigToProps } from '@builder.io/storybook';

const props = transformConfigToProps(ProductsListBuilderConfig);

export default {
  title: 'Products List',
  component: ProductsList,
};

export const DefaultProductsList = () => <ProductsList {...props}></ProductsList>;
