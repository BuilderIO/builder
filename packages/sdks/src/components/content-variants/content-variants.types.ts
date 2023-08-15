import type {
  BuilderRenderContext,
  RegisteredComponent,
} from '../../context/types.js';
import type { ApiVersion } from '../../types/api-version.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { Nullable } from '../../types/typescript.js';

export interface ContentVariantsPrps {
  content?: Nullable<BuilderContent>;
  model?: string;
  data?: { [key: string]: any };
  context?: BuilderRenderContext;
  apiKey: string;
  apiVersion?: ApiVersion;
  customComponents?: RegisteredComponent[];
  canTrack?: boolean;
  locale?: string;
  /** @deprecated use `enrich` instead **/
  includeRefs?: boolean;
  enrich?: boolean;
}
