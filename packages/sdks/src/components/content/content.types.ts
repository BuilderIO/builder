import type { BuilderRenderState } from '../../context/types.js';
export type { ContentProps } from './contentProps.types.js';

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
