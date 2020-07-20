import React from 'react';

export const BuilderStoreContext = React.createContext<BuilderStore>({
  state: {},
  rootState: {},
  content: {},
  context: {},
  update: (mutator: (state: any) => any) => null,
});

export interface BuilderStore {
  state: any;
  rootState: any;
  content: any;
  context: any;
  update: (mutator: (state: any) => any) => any;
  renderLink?: (props: React.AnchorHTMLAttributes<any>) => React.ReactNode;
}
