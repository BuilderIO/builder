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
}
