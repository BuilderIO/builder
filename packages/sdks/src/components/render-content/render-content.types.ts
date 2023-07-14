import type { BuilderRenderState } from '../../context/types';
import type { EnforcePartials } from '../../types/enforced-partials';
import type { RenderContentVariantsProps } from '../render-content-variants/render-content-variants.types';

interface InternalRenderProps {
  /**
   * TO-DO: improve qwik generator to not remap this name for non-HTML tags, then name it `className`
   */
  classNameProp: string | undefined;
  showContent: boolean;
  isSsrAbTest: boolean;
}

export type RenderContentProps = InternalRenderProps &
  EnforcePartials<RenderContentVariantsProps>;

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
