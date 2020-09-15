import React from 'react';
import { ProductsList } from '../components/ProductsList/ProductsList';
import { BuilderComponent } from '@builder.io/react';

export function Collection() {
  return (
    <>
      <BuilderComponent model="collection-hero" />
      <ProductsList />
    </>
  );
}
