import { createContext } from '@jsx-lite/core';

export const BuilderStoreContext = createContext<BuilderStore>({
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
  renderLink?: (props: Partial<HTMLAnchorElement>) => any;
}
