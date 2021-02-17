import { Builder, BuilderContent } from '@builder.io/react';
import React from 'react';
import { DoubleColumns } from '../components/DoubleColumns/DoubleColumns';
import { Hero } from '../components/Hero/Hero';
import { ProductsList } from '../components/ProductsList/ProductsList';
import { TripleColumns } from '../components/TripleColumns/TripleColumns';

export function Blocks() {
  return (
    <BuilderContent modelName="blocks">
      {data => (
        <div>
          {data?.blocks?.map((item, index) => {
            const { name, options } = item.component;

            // List manually
            if (name === 'Hero') {
              return <Hero key={index} {...options} />;
            }
            if (name === 'Products List') {
              return <ProductsList key={index} {...options} />;
            }
            if (name === 'Triple Columns') {
              return <TripleColumns key={index} {...options} />;
            }
            if (name === 'Double Columns') {
              return <DoubleColumns key={index} {...options} />;
            }

            // Or manually
            const Component = Builder.components.find(item => item.name === name);
            if (Component && Component.class) {
              return <Component.class {...options} />;
            }

            return null;
          })}
        </div>
      )}
    </BuilderContent>
  );
}
