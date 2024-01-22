import type {
  BuilderRenderContext,
  RegisteredComponent,
} from '../../context/types.js';
import type { ApiVersion } from '../../types/api-version.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { Nullable } from '../../types/typescript.js';

export interface ContentVariantsPrps {
  /**
   * The Builder content JSON to render (required).
   */
  content?: Nullable<BuilderContent>;
  /**
   * The Builder content model to render (required).
   */
  model?: string;
  /**
   * Additional data to inject into your Builder content (optional).
   */
  data?: { [key: string]: any };
  /**
   *
   */
  context?: BuilderRenderContext;
  /**
   * Your API Key: needed to dynamically fetch symbols (required).
   */
  apiKey: string;

  apiVersion?: ApiVersion;

  /**
   * An array of custom components to register (optional).
   */
  customComponents?: RegisteredComponent[];

  /**
   * A boolean to enable or disable tracking (optional). Defaults to `true`.
   */
  canTrack?: boolean;

  /**
   * A string to set the locale (optional).
   */
  locale?: string;

  /** @deprecated use `enrich` instead **/
  includeRefs?: boolean;

  /**
   * A boolean to enable or disable enriching API content (optional). Defaults to `false`.
   */
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
