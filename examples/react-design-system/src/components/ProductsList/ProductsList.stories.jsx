import React from 'react';
import { ProductsList } from './ProductsList';
import { ProductsListBuilderConfig } from './ProductsList.builder';
import { builderDecorator, transformConfigToProps } from '@builder.io/storybook';

const props = transformConfigToProps(ProductsListBuilderConfig);

export default {
  title: 'Products List',
  component: ProductsList,
  decorators: [builderDecorator],
};

export const DefaultProductsList = () => <ProductsList {...props}></ProductsList>;
