import type { ContentVariantsPrps } from '../content-variants/content-variants.types';

interface InternalRenderProps {
  showContent: boolean;
  isSsrAbTest: boolean;
}

export type ContentProps = InternalRenderProps & ContentVariantsPrps;
