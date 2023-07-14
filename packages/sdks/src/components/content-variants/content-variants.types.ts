import type {
  BuilderRenderContext,
  RegisteredComponent,
} from '../../context/types';
import type { ApiVersion } from '../../types/api-version';
import type { BuilderContent } from '../../types/builder-content';
import type { Nullable } from '../../types/typescript';

export interface ContentVariantsProps {
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
