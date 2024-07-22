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
   * The Builder content `model` to render (required).
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
   * Your API Key: needed to enable visual editing, and to dynamically fetch symbols (required).
   */
  apiKey: string;

  apiVersion?: ApiVersion;

  /**
   * An array of custom components to register (optional).
   */
  customComponents?: RegisteredComponent[];
  /**
   * The component to use for rendering links. Defaults to anchor element `<a>`.
   */
  linkComponent?: any;

  /**
   * A boolean to enable or disable tracking (optional). Defaults to `true`.
   */
  canTrack?: boolean;

  /**
   * If provided, the API will auto-resolve localized objects to the value of this `locale` key (optional).
   */
  locale?: string;

  /**
   * A boolean to enable or disable enriching API content (optional).
   *
   * Enriching will Include multilevel references in the response. Defaults to `false`.
   */
  enrich?: boolean;

  /**
   * The element that wraps your content. Defaults to `<div>` ('ScrollView' in React Native).
   */
  contentWrapper?: any;

  /**
   * Additonal props to pass to `contentWrapper`. Defaults to `{}`.
   */
  contentWrapperProps?: any;

  /**
   * The element that wraps your blocks. Defaults to `<div>` ('ScrollView' in React Native).
   */
  blocksWrapper?: any;

  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  blocksWrapperProps?: any;

  /**
   * List of hosts to allow editing content from.
   */
  trustedHosts?: string[];

  /**
   * A CSP nonce to use for the SDK's inlined `<script>` and `<style>` tags.
   */
  nonce?: string;
}
