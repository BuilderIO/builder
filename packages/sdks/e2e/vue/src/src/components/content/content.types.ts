import type { BuilderRenderState } from '../../context/types';
export type { ContentProps } from './contentProps.types';
export interface BuilderComponentStateChange {
  state: BuilderRenderState;
  ref: {
    name?: string;
    props?: {
      builderBlock?: {
        id?: string;
      };
    };
  };
}