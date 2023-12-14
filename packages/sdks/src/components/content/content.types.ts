import type { BuilderRenderState } from '../../context/types.js';
import type { EnforcePartials } from '../../types/enforced-partials.js';
import type { ContentVariantsPrps } from '../content-variants/content-variants.types.js';

interface InternalRenderProps {
  showContent: boolean;
  isSsrAbTest: boolean;
}

export type ContentProps = InternalRenderProps &
  EnforcePartials<ContentVariantsPrps>;

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
