export interface GetContentOptions {
  /** The model to get content for */
  model: string;

  /** Your public API key */
  apiKey: string;

  /** Number of items to fetch. Default is 1 */
  limit?: number;

  /**
   * Use to specify an offset for pagination of results. The default is 0.
   */
  offset?: number;

  /**
   * User attribute key value pairs to be used for targeting
   * https://www.builder.io/c/docs/custom-targeting-attributes
   *
   * e.g.
   * ```js
   * userAttributes: {
   *   urlPath: '/',
   *   returnVisitor: true,
   *   device: 'mobile'
   * }
   * ```
   */
  userAttributes?: (Record<string, string> & { urlPath?: string }) | null;

  /**
   * Mongodb style query of your data. E.g.:
   *
   * ```js
   * query: {
   *  id: 'abc123',
   *  data: {
   *    myCustomField: { $gt: 20 },
   *  }
   * }
   * ```
   *
   * See more info on MongoDB's query operators and format.
   *
   * @see {@link https://docs.mongodb.com/manual/reference/operator/query/}
   */
  query?: Record<string, any>;

  /**
   * Any other API options.
   * Accepts both a key/value object or a `URLSearchParams` instance
   * */
  options?: Record<string, any> | URLSearchParams;

  /**
   * If set to `true`, it will lazy load symbols/references.
   * If set to `false`, it will render the entire content tree eagerly.
   * @deprecated use `enrich` instead
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
   * Include content of references in the response. Defaults to `true`.
   * @deprecated use `enrich` instead
   */
  includeRefs?: boolean;

  /**
   * Include multilevel references in the response.
   */
  enrich?: boolean;

  /**
   * If provided, the API will auto-resolve localized objects to the value of this `locale` key.
   */
  locale?: string;

  /**
   * If provided, sets the Builder API version used to fetch content.
   *
   * Defaults to `v3`.
   */
  apiVersion?: 'v2' | 'v3';

  /**
   * Only include these fields.
   * Note: 'omit' takes precedence over 'fields'
   *
   * @example
   * ```
   * fields: 'id, name, data.customField'
   * ```
   */
  fields?: string;

  /**
   * Omit only these fields.
   * Note: 'omit' takes precedence over 'fields'
   *
   * @example
   * ```
   * omit: 'data.bigField,data.blocks'
   * ```
   */
  omit?: string;

  /**
   * Seconds to cache content. Sets the max-age of the cache-control header
   * response header.
   *
   * Use a higher value for better performance, lower for content that will change more frequently
   *
   * @see {@link https://www.builder.io/c/docs/query-api#__next:~:text=%26includeRefs%3Dtrue-,cacheSeconds,-No}
   */
  cacheSeconds?: number;

  /**
   * Builder.io uses stale-while-revalidate caching at the CDN level. This means we always serve
   * from edge cache and update caches in the background for maximum possible performance. This also
   * means that the more frequently content is requested, the more fresh it will be. The longest we
   * will ever hold something in stale cache is 1 day by default, and you can set this to be shorter
   * yourself as well. We suggest keeping this high unless you have content that must change rapidly
   * and gets very little traffic.
   *
   * @see {@link https://www.fastly.com/blog/prevent-application-network-instability-serve-stale-content}
   */
  staleCacheSeconds?: number;

  /**
   * Property to order results by.
   * Use 1 for ascending and -1 for descending.
   *
   * The key is what you're sorting on, so the following example sorts by createdDate
   * and because the value is 1, the sort is ascending.
   *
   * @example
   * ```
   * createdDate: 1
   * ```
   */
  sort?: { [key: string]: 1 | -1 };

  /**
   * Include content entries in a response that are still in
   * draft mode and un-archived. Default is false.
   */
  includeUnpublished?: boolean;
}
