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
  /**
   * The element that wraps your content. Defaults to `div` ('ScrollView' in React Native).
   */
  contentWrapper?: any;
  /**
   * Additonal props to pass to `contentWrapper`. Defaults to `{}`.
   */
  contentWrapperProps?: any;
  /**
   * The element that wraps your blocks. Defaults to `div` ('ScrollView' in React Native).
   */
  blocksWrapper?: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  blocksWrapperProps?: any;
}
