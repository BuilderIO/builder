import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { StateProvider, withBuilder } from '@builder.io/react';

interface StateProviderProps {
  builderBlock: BuilderElement;
  state: any;
  schema: any;
}

const ShopifySectionComponent: React.FC<StateProviderProps> = props => {
  const { schema, ...stateProviderProps } = props;
  return (
    <div
      id={`shopify-section-${schema.class?.replace('-section', '')}`}
      className={`shopify-section ${schema.class}`}
    >
      <StateProvider {...stateProviderProps} />
    </div>
  );
};

export const ShopifySection = withBuilder(ShopifySectionComponent, {
  name: 'Shopify:Section',
  canHaveChildren: true,
  static: true,
  hideFromInsertMenu: true,
});
