import type { EnforcePartials } from '../../types/enforced-partials.js';
import type { ContentVariantsPrps } from '../content-variants/content-variants.types.js';

interface InternalRenderProps {
  showContent: boolean;
  isSsrAbTest: boolean;
}

/**
 * This is in a separate file so that we can override it (most notably in Vue,
 * where prop types cannot be wrapped by generics like `EnforcePartials`).
 */
export type ContentProps = InternalRenderProps &
  EnforcePartials<ContentVariantsPrps> & {
    /**
     * For internal use only. Do not provide this prop.
     */
    isNestedRender?: boolean;
  };
