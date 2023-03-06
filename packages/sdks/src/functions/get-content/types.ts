export interface GetContentOptions {
  /** The model to get content for */
  model: string;

  /** Your public API key */
  apiKey: string;

  /** Number of items to fetch. Default is 1 */
  limit?: number;

  /** User attributes to target on, such as { urlPath: '/foo', device: 'mobile', ...etc } */
  userAttributes?: (Record<string, string> & { urlPath?: string }) | null;

  /** Custom query */
  query?: Record<string, any>;

  /**
   * Any other API options.
   * Accepts both a key/value object or a `URLSearchParams` instance
   * */
  options?: Record<string, any> | URLSearchParams;

  /**
   * If set to `true`, it will lazy load symbols/references.
   * If set to `false`, it will render the entire content tree eagerly.
   */
  noTraverse?: boolean;

  /**
   * If set to `false`, it will not use cookies to target content. Therefore, A/B Testing will be disabled and
   * only the default variation will be returned to every user.
   *
   * Defaults to `true`.
   */
  canTrack?: boolean;

  /**
   * Include references in the response. Defaults to `true`.
   */
  includeRefs?: boolean;

  /**
   * If provided, the API will auto-resolve localized objects to the value of this `locale` key.
   */
  locale?: string;

  /**
   * If provided, sets the Builder API version used to fetch content.
   *
   * Defaults to `v2`.
   */
  apiVersion?: 'v2' | 'v3';
}
