import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { StateProvider, withBuilder } from '@builder.io/react';

interface ThemeProviderProps {
  builderBlock: BuilderElement;
  state: any;
}

const ThemeProviderComponent: React.FC<ThemeProviderProps> = props => <StateProvider {...props} />;

export const ThemeProvider = withBuilder(ThemeProviderComponent, {
  name: 'Shopify:ThemeProvider',
  canHaveChildren: true,
  static: true,
  hideFromInsertMenu: true,
});
