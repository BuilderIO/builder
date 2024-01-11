import './polyfills/custom-event-polyfill';
import { IncomingMessage, ServerResponse } from 'http';
import { nextTick } from './functions/next-tick.function';
import { QueryString } from './classes/query-string.class';
import { version } from '../package.json';
import { BehaviorSubject } from './classes/observable.class';
import { getFetch, SimplifiedFetchOptions } from './functions/fetch.function';
import { assign } from './functions/assign.function';
import { throttle } from './functions/throttle.function';
import { Animator } from './classes/animator.class';
import { BuilderElement } from './types/element';
import Cookies from './classes/cookies.class';
import { omit } from './functions/omit.function';
import { getTopLevelDomain } from './functions/get-top-level-domain';
import { BuilderContent } from './types/content';
import { uuid } from './functions/uuid';
import { parse as urlParse } from './url';

// Do not change this to a require! It throws runtime errors - rollup
// will preserve the `require` and throw runtime errors
import hash from 'hash-sum';
import { toError } from './functions/to-error';
import { emptyUrl, UrlLike } from './url';
import { DEFAULT_API_VERSION, ApiVersion } from './types/api-version';

export type Url = any;

function datePlusMinutes(minutes = 30) {
  return new Date(Date.now() + minutes * 60000);
}

const isPositiveNumber = (thing: unknown) =>
  typeof thing === 'number' && !isNaN(thing) && thing >= 0;

export const isReactNative = typeof navigator === 'object' && navigator.product === 'ReactNative';

export const validEnvList = [
  'production',
  'qa',
  'test',
  'development',
  'dev',
  'cdn-qa',
  'cloud',
  'fast',
  'cdn2',
  'cdn-prod',
];

function getQueryParam(url: string, variable: string): string | null {
  const query = url.split('?')[1] || '';
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

const urlParser = {
  parse(url: string): UrlLike {
    const el: HTMLAnchorElement = document.createElement('a') as any;
    el.href = url;
    const out: any = {};

    const props = [
      'username',
      'password',
      'host',
      'hostname',
      'port',
      'protocol',
      'origin',
      'pathname',
      'search',
      'hash',
    ] as const;

    for (const prop of props) {
      out[prop] = el[prop];
    }

    // IE 11 pathname handling workaround
    // (IE omits preceeding '/', unlike other browsers)
    if (
      (out.pathname || out.pathname === '') &&
      typeof out.pathname === 'string' &&
      out.pathname.indexOf('/') !== 0
    ) {
      out.pathname = '/' + out.pathname;
    }

    return out;
  },
};

const parse: (url: string) => UrlLike = isReactNative
  ? () => emptyUrl()
  : typeof window === 'object'
  ? urlParser.parse
  : urlParse;

function setCookie(name: string, value: string, expires?: Date) {
  try {
    let expiresString = '';

    // TODO: need to know if secure server side
    if (expires) {
      expiresString = '; expires=' + expires.toUTCString();
    }

    const secure = isBrowser ? location.protocol === 'https:' : true;
    document.cookie =
      name +
      '=' +
      (value || '') +
      expiresString +
      '; path=/' +
      `; domain=${getTopLevelDomain(location.hostname)}` +
      (secure ? '; secure; SameSite=None' : '');
  } catch (err) {
    console.warn('Could not set cookie', err);
  }
}

function getCookie(name: string) {
  try {
    return (
      decodeURIComponent(
        document.cookie.replace(
          new RegExp(
            '(?:(?:^|.*;)\\s*' +
              encodeURIComponent(name).replace(/[\-\.\+\*]/g, '\\$&') +
              '\\s*\\=\\s*([^;]*).*$)|^.*$'
          ),
          '$1'
        )
      ) || null
    );
  } catch (err) {
    console.warn('Could not get cookie', err);
  }
}

function size(object: object) {
  return Object.keys(object).length;
}

function find<T = any>(target: T[], callback: (item: T, index: number, list: T[]) => boolean) {
  const list = target;
  // Makes sures is always has an positive integer as length.
  const length = list.length >>> 0;
  const thisArg = arguments[1];
  for (let i = 0; i < length; i++) {
    const element = list[i];
    if (callback.call(thisArg, element, i, list)) {
      return element;
    }
  }
}

const sessionStorageKey = 'builderSessionId';
const localStorageKey = 'builderVisitorId';

export const isBrowser = typeof window !== 'undefined' && !isReactNative;
export const isIframe = isBrowser && window.top !== window.self;

export interface ParamsMap {
  [key: string]: any;
}

type TrackingHook = (
  eventData: Event,
  context: { content?: BuilderContent; [key: string]: any }
) => Event | undefined;

interface EventData {
  contentId?: string;
  ownerId: string;
  variationId?: string;
  userAttributes?: any;
  targetSelector?: string;
  targetBuilderElement?: string;
  unique?: boolean;
  metadata?: any | string;
  meta?: any | string;
  sessionId?: string;
  visitorId?: string;
  amount?: number;
}
// TODO: share interfaces with API
interface Event {
  type: string;
  data: EventData;
}

/**
 * Attributes that can be used for custom targeting. {@link
 * https://www.builder.io/c/docs/guides/targeting-and-scheduling}
 */
export interface UserAttributes {
  [key: string]:
    | undefined
    | string
    | string[]
    | boolean
    | boolean[]
    | number
    | number[]
    | Record<string, any>;
  /**
   * URL path of the current user.
   */
  urlPath?: string;
  /**
   * @deprecated
   * @hidden
   */
  queryString?: string | ParamsMap;
  /**
   * @deprecated
   * @hidden
   */
  device?: 'mobile' | 'tablet' | 'desktop';
  /**
   * @deprecated
   * @hidden
   */
  location?: any;
  /**
   * @deprecated
   * @hidden
   */
  userAgent?: string;
  /**
   * @deprecated
   * @hidden
   */
  referrer?: string;
  /**
   * @deprecated
   * @hidden
   */
  entryMedium?: string;
  /**
   * @deprecated
   * @hidden
   */
  language?: string;
  /**
   * @deprecated
   * @hidden
   */
  browser?: string;
  /**
   * @deprecated
   * @hidden
   */
  cookie?: string;
  /**
   * @deprecated
   * @hidden
   */
  newVisitor?: boolean;
  /**
   * @deprecated
   * @hidden
   */
  operatingSystem?: string;
}

type AllowEnrich =
  | { apiVersion?: Extract<ApiVersion, 'v1'> }
  | { apiVersion?: Extract<ApiVersion, 'v3'>; enrich?: boolean }
  | { apiVersion?: never; enrich?: boolean };

export type GetContentOptions = AllowEnrich & {
  /**
   * User attribute key value pairs to be used for targeting
   * https://www.builder.io/c/docs/custom-targeting-attributes
   *
   * e.g.
   * ```js
   * userAttributes: {
   *   urlPath: '/',
   *   returnVisitor: true,
   * }
   * ```
   */
  userAttributes?: UserAttributes;
  /**
   * Alias for userAttributes.urlPath except it can handle a full URL (optionally with host,
   * protocol, query, etc) and we will parse out the path.
   */
  url?: string;
  /**
   * @package
   */
  includeUrl?: boolean;
  /**
   * Include content of references in the response.
   * If you use the `reference` field to pull in other content without this
   * enabled we will not fetch that content for the final response.
   * @deprecated use `enrich` instead
   */
  includeRefs?: boolean;
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
   * Maximum number of results to return. Defaults to `1`.
   */
  limit?: number;
  /**
   * Use to specify an offset for pagination of results. The default is 0.
   */
  offset?: number;
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
  query?: any;
  /**
   * Bust through all caches. Not recommended for production (for performance),
   * but can be useful for development and static builds (so the static site has
   * fully fresh / up to date content)
   */
  cachebust?: boolean;
  /**
   * Convert any visual builder content to HTML.
   *
   * This will be on data.html of the response's content entry object json.
   */
  prerender?: boolean;
  /**
   * Extract any styles to a separate css property when generating HTML.
   */
  extractCss?: boolean;
  /**
   * @package
   *
   * `BuilderContent` to render instead of fetching.
   */
  initialContent?: any;
  /**
   * The name of the model to fetch content for.
   */
  model?: string;
  /**
   * Set to `false` to not cache responses when running on the client.
   */
  cache?: boolean;
  /**
   * Set to the current locale in your application if you want localized inputs to be auto-resolved, should match one of the locales keys in your space settings
   * Learn more about adding or removing locales [here](https://www.builder.io/c/docs/add-remove-locales)
   */
  locale?: string;
  /**
   * @package
   *
   * Indicate that the fetch request is for preview purposes.
   */
  preview?: boolean;
  /**
   * Specific content entry ID to fetch.
   */
  entry?: string;
  /**
   * @package
   * @deprecated
   * @hidden
   */
  alias?: string;
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
  key?: string;
  /**
   * @package
   *
   * Affects HTML generation for specific targets.
   */
  format?: 'amp' | 'email' | 'html' | 'react' | 'solid';
  /**
   * @deprecated
   * @hidden
   */
  noWrap?: true;
  /**
   * @package
   *
   * Specific string to use for cache busting. e.g. every time we generate
   * HTML we generate a rev (a revision ID) and we send that with each request
   * on the client, such that if we generate new server HTML we get a new rev
   * and we use that to bust the cache because even though the content ID may
   * be the same, it could be an updated version of this content that needs to
   * be fresh.
   */
  rev?: string;
  /**
   * @package
   *
   * Tell the API that when generating HTML to generate it in static mode for
   * a/b tests instead of the older way we did this
   */
  static?: boolean;
  /**
   * Additional query params of the Content API to send.
   */
  options?: { [key: string]: any };
  /**
   * @package
   *
   * Don't listen to updates in the editor - this is useful for embedded
   * symbols so they don't accidentally listen to messages as you are editing
   * content thinking they should updates when they actually shouldn't.
   */
  noEditorUpdates?: boolean;

  /**
   * If set to `true`, it will lazy load symbols/references.
   * If set to `false`, it will render the entire content tree eagerly.
   * @deprecated use `enrich` instead
   */
  noTraverse?: boolean;

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
};

export type Class = {
  name?: string;
  new (...args: any[]): any;
};

interface Map<K, V> {
  clear(): void;
  delete(key: K): boolean;
  entries(): IterableIterator<[K, V]>;
  forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
  get(key: K): V;
  has(key: K): boolean;
  keys(): IterableIterator<K>;
  set(key: K, value?: V): Map<K, V>;
  size: number;
  values(): IterableIterator<V>;
  [Symbol.iterator](): IterableIterator<[K, V]>;
}

/**
 * This is the interface for inputs in `Builder.registerComponent`
 *
 * ```js
 * Builder.registerComponent(MyComponent, {
 *   inputs: [{ name: 'title', type: 'text' }] // <- Input[]
 * })
 * ```
 *
 * Learn more about registering custom components [here](https://www.builder.io/c/docs/custom-react-components)
 */
export interface Input {
  /** This is the name of the component prop this input represents */
  name: string;
  /** A friendlier name to show in the UI if the component prop name is not ideal for end users */
  friendlyName?: string;
  /** @hidden @deprecated */
  description?: string;
  /** A default value to use */
  defaultValue?: any;
  /**
   * The type of input to use, such as 'text'
   *
   * See all available inputs [here](https://www.builder.io/c/docs/custom-react-components#input-types)
   * and you can create your own custom input types and associated editor UIs with [plugins](https://www.builder.io/c/docs/extending/plugins)
   */
  type: string;
  /** Is this input mandatory or not */
  required?: boolean;
  /** @hidden */
  autoFocus?: boolean;
  subFields?: Input[];
  /**
   * Additional text to render in the UI to give guidance on how to use this
   *
   * @example
   * ```js
   * helperText: 'Be sure to use a proper URL, starting with "https://"'
   * 111
   */
  helperText?: string;
  /** @hidden */
  allowedFileTypes?: string[];
  /** @hidden */
  imageHeight?: number;
  /** @hidden */
  imageWidth?: number;
  /** @hidden */
  mediaHeight?: number;
  /** @hidden */
  mediaWidth?: number;
  /** @hidden */
  hideFromUI?: boolean;
  /** @hidden */
  modelId?: string;
  /**
   * Number field type validation maximum accepted input
   */
  max?: number;
  /**
   * Number field type validation minimum accepted input
   */
  min?: number;
  /**
   * Number field type step size when using arrows
   */
  step?: number;

  /**
   * Set this to `true` to show the editor for this input when
   * children of this component are selected. This is useful for things
   * like Tabs, such that users may not always select the Tabs component
   * directly but will still be looking for how to add additional tabs
   */
  broadcast?: boolean;
  /**
   * Set this to `true` to show the editor for this input when
   * group locked parents of this component are selected. This is useful
   * to bubble up important inputs for locked groups, like text and images
   */
  bubble?: boolean;
  /**
   * Set this to `true` if you want this component to be translatable
   */
  localized?: boolean;
  /** @hidden */
  options?: { [key: string]: any };
  /**
   * For "text" input type, specifying an enum will show a dropdown of options instead
   */
  enum?: string[] | { label: string; value: string | number | boolean; helperText?: string }[];
  /** Regex field validation for all string types (text, longText, html, url, etc) */
  regex?: {
    /** pattern to test, like "^\/[a-z]$" */
    pattern: string;
    /** flags for the RegExp constructor, e.g. "gi"  */
    options?: string;
    /**
     * Friendly message to display to end-users if the regex fails, e.g.
     * "You must use a relative url starting with '/...' "
     */
    message: string;
  };
  /**
   * Set this to `true` to put this under the "show more" section of
   * the options editor. Useful for things that are more advanced
   * or more rarely used and don't need to be too prominent
   */
  advanced?: boolean;
  /** @hidden */
  onChange?: Function | string;
  /** @hidden */
  code?: boolean;
  /** @hidden */
  richText?: boolean;
  /** @hidden */
  showIf?: ((options: Map<string, any>) => boolean) | string;
  /** @hidden */
  copyOnAdd?: boolean;
  /**
   * Use optionally with inputs of type `reference`. Restricts the content entry picker to a specific model by name.
   */
  model?: string;
}

/**
 * This is the interface for the options for `Builder.registerComponent`
 *
 * ```js
 * Builder.registerComponent(YourComponent, {
 *  // <- Component options
 * })
 * ```
 *
 * Learn more about registering custom components [here](https://www.builder.io/c/docs/custom-react-components)
 */
export interface Component {
  /**
   * Name your component something unique, e.g. 'MyButton'. You can override built-in components
   * by registering a component with the same name, e.g. 'Text', to replace the built-in text component
   */
  name: string;
  /** @hidden @deprecated */
  description?: string;
  /**
   * Link to a documentation page for this component
   */
  docsLink?: string;
  /**
   * Link to an image to be used as an icon for this component in Builder's editor
   *
   * @example
   * ```js
   * image: 'https://some-cdn.com/my-icon-for-this-component.png'
   * ```
   */
  image?: string;
  /**
   * Link to a screenshot shown when user hovers over the component in Builder's editor
   * use https://builder.io/upload to upload your screeshot, for easier resizing by Builder.
   */
  screenshot?: string;

  /**
   * When overriding built-in components, if you don't want any special behavior that
   * the original has, set this to `true` to skip the default behavior
   *
   * Default behaviors include special "virtual options", such as a custom
   * aspect ratio editor for Images, or a special column editor for Columns
   *
   * Learn more about overriding built-in components here: https://www.builder.io/c/docs/custom-components-overriding
   */
  override?: boolean;

  /**
   * Input schema for your component for users to fill in the options via a UI
   * that translate to this components props
   */
  inputs?: Input[];
  /** @hidden @deprecated */
  class?: any;
  /** @hidden @deprecated */
  type?: 'angular' | 'webcomponent' | 'react' | 'vue';
  /**
   * Default styles to apply when droppged into the Builder.io editor
   *
   * @example
   * ```js
   * defaultStyles: {
   *   // large (default) breakpoint
   *   large: {
   *     backgroundColor: 'black'
   *   },
   * }
   * ```
   */
  defaultStyles?: { [key: string]: string };
  /**
   * Turn on if your component can accept children. Be sure to use in combination with
   * withChildren(YourComponent) like here
   * github.com/BuilderIO/builder/blob/master/examples/react-design-system/src/components/HeroWithChildren/HeroWithChildren.builder.js#L5
   */
  canHaveChildren?: boolean;
  /** @hidden */
  fragment?: boolean;
  /**
   * Do not wrap a component in a dom element. Be sure to use {...props.attributes} with this option
   * like here github.com/BuilderIO/builder/blob/master/packages/react/src/blocks/forms/Input.tsx#L34
   */
  noWrap?: boolean;
  /**
   * Default children
   */
  defaultChildren?: BuilderElement[];
  /**
   * Default options to merge in when creating this block
   */
  defaults?: Partial<BuilderElement>;
  /** @hidden @deprecated */
  hooks?: { [key: string]: string | Function };
  /**
   * Hide your component in editor, useful for gradually deprecating components
   */
  hideFromInsertMenu?: boolean;
  /** Custom tag name (for custom webcomponents only) */
  tag?: string;
  /** @hidden @deprecated */
  static?: boolean;
  /**
   * Passing a list of model names will restrict using the component to only the models listed here, otherwise it'll be available for all models
   */
  models?: string[];

  /**
   * Specify restrictions direct children must match
   */
  childRequirements?: {
    /** Message to show when this doesn't match, e.g. "Children of 'Columns' must be a 'Column'" */
    message: string;
    /** Simple way to say children must be a specific component name */
    component?: string;
    /**
     * More advanced - specify a MongoDB-style query (using sift.js github.com/crcn/sift.js)
     * of what the children objects should match, e.g.
     *
     * @example
     *  query: {
     *    // Child of this element must be a 'Button' or 'Text' component
     *    'component.name': { $in: ['Button', 'Text'] }
     *  }
     */
    query?: any;
  };

  /**
   * Specify restrictions any parent must match
   */
  requiresParent?: {
    /** Message to show when this doesn't match, e.g. "'Add to cart' buttons must be within a 'Product box'" */
    message: string;
    /** Simple way to say a parent must be a specific component name, e.g. 'Product box' */
    component?: string;

    /**
     * More advanced - specify a MongoDB-style query (using sift.js github.com/crcn/sift.js)
     * of what at least one parent in the parents hierarchy should match, e.g.
     *
     * @example
     *  query: {
     *    // Thils element must be somewhere inside either a 'Product box' or 'Collection' component
     *    'component.name': { $in: ['Product Box', 'Collection'] }
     *  }
     */
    query?: any;
  };

  friendlyName?: string;

  /**
   * Use to restrict access to your component based on a the current user permissions
   * By default components will show to all users
   * for more information on permissions in builder check https://www.builder.io/c/docs/guides/roles-and-permissions
   */
  requiredPermissions?: Array<Permission>;
}

type Permission = 'read' | 'publish' | 'editCode' | 'editDesigns' | 'admin' | 'create';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export interface InsertMenuItem {
  name: string;
  icon?: string;
  item: DeepPartial<BuilderElement>;
}

/**
 * Use this to register custom sections in the Insert menu, for instance
 * to make new sections to organize your custom components
 *
 * ![Example of what a custom section looks like](https://cdn.builder.io/api/v1/image/assets%2F7f7bbcf72a1a4d72bac5daa359e7befd%2Fe5f2792e9c0f44ed89a9dcb77b945858)
 *
 * @example
 * ```js
 * Builder.register('insertMenu', {
 *   name: 'Our components',
 *   items: [
 *     { name: 'Hero' },
 *     { name: 'Double Columns' },
 *     { name: 'Triple Columns' },
 *     { name: 'Dynamic Columns' },
 *   ],
 * })
 * ```
 *
 * You can make as many custom sections as you like
 *
 * See a complete usage example [here](https://github.com/builderio/builder/blob/main/examples/react-design-system/src/builder-settings.js)
 */
export interface InsertMenuConfig {
  name: string;
  priority?: number;
  persist?: boolean;
  advanced?: boolean;
  items: InsertMenuItem[];
}

export function BuilderComponent(info: Partial<Component> = {}) {
  return Builder.Component(info);
}

// TODO
type Settings = any;

export interface Action {
  name: string;
  inputs?: Input[];
  returnType?: Input;
  action: Function | string;
}

export class Builder {
  /**
   * @hidden
   * @deprecated. This is buggy, and always behind by a version.
   */
  static VERSION = version;

  static components: Component[] = [];
  static singletonInstance: Builder;
  /**
   * Makes it so that a/b tests generate code like {@link
   * https://www.builder.io/blog/high-performance-no-code#__next:~:text=Static%20generated%20A%2FB%20testing}
   * instead of the old way where we render only one test group at a time on the
   * server. This is the preferred/better way not and we should ultimately make it
   * the default
   */
  static isStatic = true;
  static animator = new Animator();

  static nextTick = nextTick;
  static throttle = throttle;

  static editors: any[] = [];
  static trustedHosts: string[] = ['builder.io', 'localhost'];
  static serverContext: any;
  static plugins: any[] = [];

  static actions: Action[] = [];
  static registry: { [key: string]: any[] } = {};
  static overrideHost: string | undefined;

  /**
   * @todo `key` property on any info where if a key matches a current
   * key it gets removed
   */
  static register(type: 'insertMenu', info: InsertMenuConfig): void;
  static register(type: string, info: any): void;
  static register(type: string, info: any) {
    // TODO: all must have name and can't conflict?
    let typeList = this.registry[type];
    if (!typeList) {
      typeList = this.registry[type] = [];
    }
    typeList.push(info);
    if (Builder.isBrowser) {
      const message = {
        type: 'builder.register',
        data: {
          type,
          info,
        },
      };
      try {
        parent.postMessage(message, '*');
        if (parent !== window) {
          window.postMessage(message, '*');
        }
      } catch (err) {
        console.debug('Could not postmessage', err);
      }
    }
    this.registryChange.next(this.registry);
  }

  static registryChange = new BehaviorSubject({} as typeof Builder.registry);

  static registerEditor(info: any) {
    if (Builder.isBrowser) {
      window.postMessage(
        {
          type: 'builder.registerEditor',
          data: omit(info, 'component'),
        },
        '*'
      );
      const { hostname } = location;

      if (!Builder.isTrustedHost(hostname)) {
        console.error(
          'Builder.registerEditor() called in the wrong environment! You cannot load custom editors from your app, they must be loaded through the Builder.io app itself. Follow the readme here for more details: https://github.com/builderio/builder/tree/master/plugins/cloudinary or contact chat us in our Spectrum community for help: https://spectrum.chat/builder'
        );
      }
    }
    this.editors.push(info);
  }

  static registerPlugin(info: any) {
    this.plugins.push(info);
  }

  static registerAction(action: Action) {
    this.actions.push(action);
  }

  static registerTrustedHost(host: string) {
    this.trustedHosts.push(host);
  }

  /**
   * @param context @type {import('isolated-vm').Context}
   * Use this function to control the execution context of custom code on the server.
   * const ivm = require('isolated-vm');
   * const isolate = new ivm.Isolate({ memoryLimit: 128 });
   * const context = isolate.createContextSync();
   * Builder.setServerContext(context);
   */
  static setServerContext(context: any) {
    this.serverContext = context;
  }

  static isTrustedHost(hostname: string) {
    return (
      this.trustedHosts.findIndex(
        trustedHost => trustedHost === hostname || hostname.endsWith(`.${trustedHost}`)
      ) > -1
    );
  }

  static runAction(action: Action | string) {
    // TODO
    const actionObject =
      typeof action === 'string' ? find(this.actions, item => item.name === action) : action;

    if (!actionObject) {
      throw new Error(`Action not found: ${action}`);
    }
  }

  static fields(name: string, fields: Input[]) {
    window.parent?.postMessage(
      {
        type: 'builder.fields',
        data: { name, fields },
      },
      '*'
    );
  }

  private static _editingPage = false;

  static isIframe = isIframe;
  static isBrowser = isBrowser;
  static isReactNative = isReactNative;
  static isServer = !isBrowser && !isReactNative;
  static previewingModel = Builder.isBrowser && getQueryParam(location.href, 'builder.preview');

  static settings: Settings = {};
  static settingsChange = new BehaviorSubject<Settings>({});

  /**
   * @deprecated
   * @hidden
   *
   * Use Builder.register('editor.settings', {}) instead.
   */
  static set(settings: Settings): void {
    Builder.register('editor.settings', settings);
  }

  static import(packageName: string) {
    if (!Builder.isBrowser) {
      // TODO: server side support *maybe*
      console.warn('Builder.import used on the server - this should only be used in the browser');
      return;
    }
    const { System } = window as any;

    if (!System) {
      console.warn('System.js not available. Please include System.js when using Builder.import');
      return;
    }
    return System.import(`https://cdn.builder.io/systemjs/${packageName}`);
  }

  // TODO: this is quick and dirty, do better implementation later. Also can be unreliable
  // if page 301s etc. Use a query param instead? also could have issues with redirects. Injecting var could
  // work but is async...
  static isEditing = Boolean(
    isIframe &&
      ((document.referrer && document.referrer.match(/builder\.io|localhost:1234/)) ||
        location.search.indexOf('builder.frameEditing=') !== -1)
  );

  static isPreviewing = Boolean(
    isBrowser &&
      (location.search.indexOf('builder.preview=') !== -1 ||
        location.search.indexOf('builder.frameEditing=') !== -1)
  );

  // useCdnApi = false;

  static get editingPage() {
    return this._editingPage;
  }

  static set editingPage(editingPage) {
    this._editingPage = editingPage;
    if (isBrowser && isIframe) {
      if (editingPage) {
        document.body.classList.add('builder-editing-page');
      } else {
        document.body.classList.remove('builder-editing-page');
      }
    }
  }

  private static prepareComponentSpecToSend(spec: Component): Component {
    return {
      ...spec,
      ...(spec.inputs && {
        inputs: spec.inputs.map((input: any) => {
          // TODO: do for nexted fields too
          // TODO: probably just convert all functions, not just
          // TODO: put this in input hooks: { onChange: ..., showIf: ... }
          const keysToConvertFnToString = ['onChange', 'showIf'];

          for (const key of keysToConvertFnToString) {
            if (input[key] && typeof input[key] === 'function') {
              const fn = input[key];
              input = {
                ...input,
                [key]: `return (${fn.toString()}).apply(this, arguments)`,
              };
            }
          }

          return input;
        }),
      }),
      hooks: Object.keys(spec.hooks || {}).reduce((memo, key) => {
        const value = spec.hooks && spec.hooks[key];
        if (!value) {
          return memo;
        }
        if (typeof value === 'string') {
          memo[key] = value;
        } else {
          memo[key] = `return (${value.toString()}).apply(this, arguments)`;
        }
        return memo;
      }, {} as { [key: string]: string }),
      class: undefined,
    };
  }

  static registerBlock(component: any, options: Component) {
    this.registerComponent(component, options);
  }

  static registerComponent(component: any, options: Component) {
    const spec = {
      class: component,
      ...component.builderOptions,
      ...options,
    };
    this.addComponent(spec);
    const editable =
      options.models && this.singletonInstance.editingModel
        ? isBrowser && options.models.includes(this.singletonInstance.editingModel)
        : isBrowser;
    if (editable) {
      const sendSpec = this.prepareComponentSpecToSend(spec);
      window.parent?.postMessage(
        {
          type: 'builder.registerComponent',
          data: sendSpec,
        },
        '*'
      );
    }
  }

  private static addComponent(component: Component) {
    const current = find(this.components, item => item.name === component.name);
    if (current) {
      // FIXME: why does sometimes we get an extra post without class - probably
      // from postMessage handler wrong in some place
      if (current.class && !component.class) {
        return;
      }
      this.components.splice(this.components.indexOf(current), 1, component);
    } else {
      this.components.push(component);
    }
  }

  // TODO: style guide, etc off this system as well?
  static component(info: Partial<Component> = {}) {
    return (component: Class) => {
      const spec = { ...info, class: component };
      if (!spec.name) {
        spec.name = component.name;
      }
      this.addComponent(spec as Component);

      const sendSpec = this.prepareComponentSpecToSend(spec as Component);
      // TODO: serialize component name and inputs
      if (isBrowser) {
        window.parent?.postMessage(
          {
            type: 'builder.registerComponent',
            data: sendSpec,
          },
          '*'
        );
      }
      return component;
    };
  }

  static isReact = false;

  static get Component() {
    return this.component;
  }

  private eventsQueue: Event[] = [];

  private throttledClearEventsQueue = throttle(() => {
    this.processEventsQueue();
    // Extend the session cookie
    this.setCookie(sessionStorageKey, this.sessionId, datePlusMinutes(30));
  }, 5);

  private processEventsQueue() {
    if (!this.eventsQueue.length) {
      return;
    }
    const events = this.eventsQueue;
    this.eventsQueue = [];

    const fullUserAttributes = {
      ...Builder.overrideUserAttributes,
      ...this.trackingUserAttributes,
    };
    for (const event of events) {
      if (!event.data.metadata) {
        event.data.metadata = {};
      }
      if (!event.data.metadata.user) {
        event.data.metadata.user = {};
      }
      Object.assign(event.data.metadata.user, fullUserAttributes, event.data.metadata.user);
    }

    const host = this.host;

    getFetch()(`${host}/api/v1/track`, {
      method: 'POST',
      body: JSON.stringify({ events }),
      headers: {
        'content-type': 'application/json',
      },
      mode: 'cors',
    }).catch(() => {
      // Not the end of the world
    });
  }

  env: string = 'production';

  sessionId = this.getSessionId();

  targetContent = true;

  contentPerRequest = 1;

  // TODO: make array or function
  allowCustomFonts = true;

  private cookies: Cookies | null = null;

  // TODO: api options object
  private cachebust = false;
  private overrideParams = '';
  private noCache = false;
  private preview = false;

  get browserTrackingDisabled() {
    return Builder.isBrowser && Boolean((window as any).builderNoTrack || !navigator.cookieEnabled);
  }

  get canTrack() {
    return this.canTrack$.value;
  }

  set canTrack(canTrack) {
    if (this.canTrack !== canTrack) {
      this.canTrack$.next(canTrack);
    }
  }

  get apiVersion() {
    return this.apiVersion$.value;
  }

  set apiVersion(apiVersion: ApiVersion | undefined) {
    if (this.apiVersion !== apiVersion) {
      this.apiVersion$.next(apiVersion);
    }
  }

  private apiVersion$ = new BehaviorSubject<ApiVersion | undefined>(undefined);
  private canTrack$ = new BehaviorSubject(!this.browserTrackingDisabled);
  private apiKey$ = new BehaviorSubject<string | null>(null);
  private authToken$ = new BehaviorSubject<string | null>(null);

  userAttributesChanged = new BehaviorSubject<any>(null);

  get editingMode() {
    return this.editingMode$.value;
  }

  set editingMode(value) {
    if (value !== this.editingMode) {
      this.editingMode$.next(value);
    }
  }

  editingMode$ = new BehaviorSubject(isIframe);

  get editingModel() {
    return this.editingModel$.value;
  }

  set editingModel(value) {
    if (value !== this.editingModel) {
      this.editingModel$.next(value);
    }
  }

  private findParentElement(
    target: HTMLElement,
    callback: (element: HTMLElement) => boolean,
    checkElement = true
  ): HTMLElement | null {
    if (!(target instanceof HTMLElement)) {
      return null;
    }
    let parent: HTMLElement | null = checkElement ? target : target.parentElement;
    do {
      if (!parent) {
        return null;
      }

      const matches = callback(parent);
      if (matches) {
        return parent;
      }
    } while ((parent = parent.parentElement));

    return null;
  }

  private findBuilderParent(target: HTMLElement) {
    return this.findParentElement(target, el => {
      const id = el.getAttribute('builder-id') || el.id;
      return Boolean(id && id.indexOf('builder-') === 0);
    });
  }

  // TODO: decorator to do this stuff with the get/set (how do with typing too? compiler?)
  editingModel$ = new BehaviorSubject<null | string>(null);

  setUserAgent(userAgent: string) {
    this.userAgent = userAgent || '';
  }
  userAgent: string = (typeof navigator === 'object' && navigator.userAgent) || '';

  trackingHooks: TrackingHook[] = [];

  /**
   * Set a hook to modify events being tracked from builder, such as impressions and clicks
   *
   * For example, to track the model ID of each event associated with content for querying
   * by mode, you can do
   *
   *    builder.setTrackingHook((event, context) => {
   *      if (context.content) {
   *        event.data.metadata.modelId = context.content.modelId
   *      }
   *    })
   */
  setTrackingHook(hook: TrackingHook) {
    this.trackingHooks.push(hook);
  }

  track(eventName: string, properties: Partial<EventData> = {}, context?: any) {
    // TODO: queue up track requests and fire them off when canTrack set to true - otherwise may get lots of clicks with no impressions
    if (isIframe || !isBrowser || Builder.isPreviewing) {
      return;
    }

    const apiKey = this.apiKey;
    if (!apiKey) {
      console.error(
        'Builder integration error: Looks like the Builder SDK has not been initialized properly (your API key has not been set). Make sure you are calling `builder.init("«YOUR-API-KEY»");` as early as possible in your application\'s code.'
      );
      return;
    }

    let eventData: Event = JSON.parse(
      JSON.stringify({
        type: eventName,
        data: {
          ...omit(properties, 'meta'),
          metadata: {
            sdkVersion: Builder.VERSION,
            url: location.href,
            ...properties.meta,
            ...properties.metadata,
          },
          ownerId: apiKey,
          userAttributes: this.getUserAttributes(),
          sessionId: this.sessionId,
          visitorId: this.visitorId,
        },
      })
    );

    for (const hook of this.trackingHooks) {
      const returnValue = hook(eventData, context || {});
      if (returnValue) {
        eventData = returnValue;
      }
    }

    // batch events
    this.eventsQueue.push(eventData);

    if (this.canTrack) {
      this.throttledClearEventsQueue();
    }
  }

  getSessionId() {
    let sessionId: string | null = null;
    try {
      if (Builder.isBrowser && typeof sessionStorage !== 'undefined') {
        sessionId = this.getCookie(sessionStorageKey);
      }
    } catch (err) {
      console.debug('Session storage error', err);
      // It's ok
    }

    if (!sessionId) {
      sessionId = uuid();
    }

    // Give the app a second to start up and set canTrack to false if needed
    if (Builder.isBrowser) {
      setTimeout(() => {
        try {
          if (this.canTrack) {
            this.setCookie(sessionStorageKey, sessionId, datePlusMinutes(30));
          }
        } catch (err) {
          console.debug('Cookie setting error', err);
        }
      });
    }
    return sessionId;
  }

  // Set this to control the userId
  // TODO: allow changing it mid session and updating existing data to be associated
  // e.g. for when a user navigates and then logs in
  visitorId: string = this.getVisitorId();

  getVisitorId() {
    if (this.visitorId) {
      return this.visitorId;
    }
    let visitorId: string | null = null;
    try {
      if (Builder.isBrowser && typeof localStorage !== 'undefined') {
        // TODO: cookie instead?
        visitorId = localStorage.getItem(localStorageKey);
      }
    } catch (err) {
      console.debug('Local storage error', err);
      // It's ok
    }

    if (!visitorId) {
      visitorId = uuid();
    }

    this.visitorId = visitorId;

    // Give the app a second to start up and set canTrack to false if needed
    if (Builder.isBrowser) {
      setTimeout(() => {
        try {
          if (this.canTrack && typeof localStorage !== 'undefined' && visitorId) {
            localStorage.setItem(localStorageKey, visitorId);
          }
        } catch (err) {
          console.debug('Session storage error', err);
        }
      });
    }
    return visitorId;
  }

  trackImpression(contentId: string, variationId?: string, properties?: any, context?: any) {
    if (isIframe || !isBrowser || Builder.isPreviewing) {
      return;
    }
    // TODO: use this.track method
    this.track(
      'impression',
      {
        contentId,
        variationId: variationId !== contentId ? variationId : undefined,
        metadata: properties,
      },
      context
    );
  }

  trackConversion(amount?: number, customProperties?: any): void;
  trackConversion(
    amount?: number,
    contentId?: string | any,
    variationId?: string,
    customProperties?: any,
    context?: any
  ) {
    if (isIframe || !isBrowser || Builder.isPreviewing) {
      return;
    }
    const meta = typeof contentId === 'object' ? contentId : customProperties;
    const useContentId = typeof contentId === 'string' ? contentId : undefined;

    this.track('conversion', { amount, variationId, meta, contentId: useContentId }, context);
  }

  autoTrack = !Builder.isBrowser
    ? false
    : !this.isDevelopmentEnv &&
      !(Builder.isBrowser && location.search.indexOf('builder.preview=') !== -1);

  // TODO: set this for QA
  private get isDevelopmentEnv() {
    // Automatic determining of development environment
    return (
      Builder.isIframe ||
      (Builder.isBrowser && (location.hostname === 'localhost' || location.port !== '')) ||
      this.env !== 'production'
    );
  }

  trackInteraction(
    contentId: string,
    variationId?: string,
    alreadyTrackedOne = false,
    event?: MouseEvent,
    context?: any
  ) {
    if (isIframe || !isBrowser || Builder.isPreviewing) {
      return;
    }
    const target = event && (event.target as HTMLElement);
    const targetBuilderElement = target && this.findBuilderParent(target);

    function round(num: number) {
      return Math.round(num * 1000) / 1000;
    }

    const metadata: any = {};
    if (event) {
      const { clientX, clientY } = event;
      if (target) {
        const targetRect = target.getBoundingClientRect();
        const xOffset = clientX - targetRect.left;
        const yOffset = clientY - targetRect.top;

        const xRatio = round(xOffset / targetRect.width);
        const yRatio = round(yOffset / targetRect.height);

        metadata.targetOffset = {
          x: xRatio,
          y: yRatio,
        };
      }
      if (targetBuilderElement) {
        const targetRect = targetBuilderElement.getBoundingClientRect();
        const xOffset = clientX - targetRect.left;
        const yOffset = clientY - targetRect.top;

        const xRatio = round(xOffset / targetRect.width);
        const yRatio = round(yOffset / targetRect.height);

        metadata.builderTargetOffset = {
          x: xRatio,
          y: yRatio,
        };
      }
    }

    const builderId =
      targetBuilderElement &&
      (targetBuilderElement.getAttribute('builder-id') || targetBuilderElement.id);

    if (builderId && targetBuilderElement) {
      metadata.builderElementIndex = ([] as Element[]).slice
        .call(document.getElementsByClassName(builderId))
        .indexOf(targetBuilderElement);
    }

    this.track(
      'click',
      {
        contentId,
        metadata,
        variationId: variationId !== contentId ? variationId : undefined,
        unique: !alreadyTrackedOne,
        targetBuilderElement: builderId || undefined,
      },
      context
    );
  }

  static overrideUserAttributes: Partial<UserAttributes> = {};

  trackingUserAttributes: { [key: string]: any } = {};

  component(info: Partial<Component> = {}) {
    return Builder.component(info);
  }

  get apiKey() {
    return this.apiKey$.value;
  }

  set apiKey(key: string | null) {
    this.apiKey$.next(key);
  }

  get authToken() {
    return this.authToken$.value;
  }

  set authToken(token: string | null) {
    this.authToken$.next(token);
  }

  constructor(
    apiKey: string | null = null,
    protected request?: IncomingMessage,
    protected response?: ServerResponse,
    forceNewInstance = false,
    authToken: string | null = null,
    apiVersion?: ApiVersion
  ) {
    // TODO: use a window variable for this perhaps, e.g. bc webcomponents may be loading builder twice
    // with it's and react (use rollup build to fix)
    if (Builder.isBrowser && !forceNewInstance && Builder.singletonInstance) {
      return Builder.singletonInstance;
    }

    if (this.request && this.response) {
      this.setUserAgent((this.request.headers['user-agent'] as string) || '');
      this.cookies = new Cookies(this.request, this.response);
    }

    if (apiKey) {
      this.apiKey = apiKey;
    }
    if (apiVersion) {
      this.apiVersion = apiVersion;
    }
    if (authToken) {
      this.authToken = authToken;
    }
    if (isBrowser) {
      this.bindMessageListeners();

      if (Builder.isEditing) {
        parent.postMessage(
          {
            type: 'builder.animatorOptions',
            data: {
              options: {
                version: 2,
              },
            },
          },
          '*'
        );
      }
      // TODO: postmessage to parent the builder info for every package
      // type: 'builder.sdk', data: { name: '@builder.io/react', version: '0.1.23' }
      // (window as any).BUILDER_VERSION = Builder.VERSION;
      // Ensure always one Builder global singleton
      // TODO: some people won't want this, e.g. rakuten
      // Maybe hide this behind symbol or on document, etc
      // if ((window as any).Builder) {
      //   Builder.components = (window as any).Builder.components;
      // } else {
      //   (window as any).Builder = Builder;
      // }
    }

    if (isIframe) {
      this.messageFrameLoaded();
    }

    // TODO: on destroy clear subscription
    this.canTrack$.subscribe((value: any) => {
      if (value) {
        if (typeof sessionStorage !== 'undefined') {
          try {
            if (!sessionStorage.getItem(sessionStorageKey)) {
              sessionStorage.setItem(sessionStorageKey, this.sessionId);
            }
          } catch (err) {
            console.debug('Session storage error', err);
          }
        }
        if (this.eventsQueue.length) {
          this.throttledClearEventsQueue();
        }
        if (this.cookieQueue.length) {
          this.cookieQueue.forEach(item => {
            this.setCookie(item[0], item[1]);
          });
          this.cookieQueue.length = 0;
        }
      }
    });

    if (isBrowser) {
      // TODO: defer so subclass constructor runs and injects location service
      this.setTestsFromUrl();
      // TODO: do this on every request send?
      this.getOverridesFromQueryString();
    }
  }

  private modifySearch(search: string) {
    return search.replace(
      /(^|&|\?)(builder_.*?)=/gi,
      (_match, group1, group2) => group1 + group2.replace(/_/g, '.') + '='
    );
  }

  setTestsFromUrl() {
    const search = this.getLocation().search;
    const params = QueryString.parseDeep(this.modifySearch(search || '').substr(1));
    const tests = params.builder && params.builder.tests;
    if (tests && typeof tests === 'object') {
      for (const key in tests) {
        if (tests.hasOwnProperty(key)) {
          this.setTestCookie(key, tests[key]);
        }
      }
    }
  }

  resetOverrides() {
    // Ugly - pass down instances per request instead using react context
    // or use builder.get('foo', { req, res }) in react...........
    Builder.overrideUserAttributes = {};
    this.cachebust = false;
    this.noCache = false;
    this.preview = false;
    this.editingModel = null;
    this.overrides = {};
    this.env = 'production';
    this.userAgent = '';
    this.request = undefined;
    this.response = undefined;
  }

  getOverridesFromQueryString() {
    const location = this.getLocation();
    const params = QueryString.parseDeep(this.modifySearch(location.search || '').substr(1));
    const { builder } = params;
    if (builder) {
      const {
        userAttributes,
        overrides,
        env,
        host,
        api,
        cachebust,
        noCache,
        preview,
        editing,
        frameEditing,
        options,
        params: overrideParams,
      } = builder;

      if (userAttributes) {
        this.setUserAttributes(userAttributes);
      }

      if (options) {
        // picking only locale, includeRefs, and enrich for now
        this.queryOptions = {
          ...(options.locale && { locale: options.locale }),
          ...(options.includeRefs && { includeRefs: options.includeRefs }),
          ...(options.enrich && { enrich: options.enrich }),
        };
      }

      if (overrides) {
        this.overrides = overrides;
      }

      if (validEnvList.indexOf(env || api) > -1) {
        this.env = env || api;
      }

      if (Builder.isEditing) {
        const editingModel = frameEditing || editing || preview;
        if (editingModel && editingModel !== 'true') {
          this.editingModel = editingModel;
        }
      }

      if (cachebust) {
        this.cachebust = true;
      }

      if (noCache) {
        this.noCache = true;
      }

      if (preview) {
        this.preview = true;
      }

      if (params) {
        this.overrideParams = overrideParams;
      }
    }
  }

  private messageFrameLoaded() {
    window.parent?.postMessage(
      {
        type: 'builder.loaded',
        data: {
          value: true,
        },
      },
      '*'
    );
  }

  private blockContentLoading = '';

  private bindMessageListeners() {
    if (isBrowser) {
      addEventListener('message', event => {
        const url = parse(event.origin);
        const isRestricted =
          ['builder.register', 'builder.registerComponent'].indexOf(event.data?.type) === -1;
        const isTrusted = url.hostname && Builder.isTrustedHost(url.hostname);
        if (isRestricted && !isTrusted) {
          return;
        }

        const { data } = event;
        if (data) {
          switch (data.type) {
            case 'builder.ping': {
              window.parent?.postMessage(
                {
                  type: 'builder.pong',
                  data: {},
                },
                '*'
              );
              break;
            }
            case 'builder.register': {
              // TODO: possibly do this for all...
              if (event.source === window) {
                break;
              }
              const options = data.data;
              if (!options) {
                break;
              }
              const { type, info } = options;
              // TODO: all must have name and can't conflict?
              let typeList = Builder.registry[type];
              if (!typeList) {
                typeList = Builder.registry[type] = [];
              }
              typeList.push(info);
              Builder.registryChange.next(Builder.registry);
              break;
            }
            case 'builder.settingsChange': {
              // TODO: possibly do this for all...
              if (event.source === window) {
                break;
              }
              const settings = data.data;
              if (!settings) {
                break;
              }
              Object.assign(Builder.settings, settings);
              Builder.settingsChange.next(Builder.settings);
              break;
            }
            case 'builder.registerEditor': {
              // TODO: possibly do this for all...
              if (event.source === window) {
                break;
              }
              const info = data.data;
              if (!info) {
                break;
              }
              const hasComponent = !!info.component;
              Builder.editors.every((thisInfo, index) => {
                if (info.name === thisInfo.name) {
                  if (thisInfo.component && !hasComponent) {
                    return false;
                  } else {
                    Builder.editors[index] = thisInfo;
                  }
                  return false;
                }
                return true;
              });
              break;
            }
            case 'builder.triggerAnimation': {
              Builder.animator.triggerAnimation(data.data);
              break;
            }
            case 'builder.contentUpdate':
              const key =
                data.data.key || data.data.alias || data.data.entry || data.data.modelName;
              const contentData = data.data.data; // hmmm...
              const observer = this.observersByKey[key];
              if (observer && !this.noEditorUpdates[key]) {
                observer.next([contentData]);
              }
              break;

            case 'builder.getComponents':
              window.parent?.postMessage(
                {
                  type: 'builder.components',
                  data: Builder.components.map(item => Builder.prepareComponentSpecToSend(item)),
                },
                '*'
              );
              break;

            case 'builder.editingModel':
              this.editingModel = data.data.model;
              break;

            case 'builder.registerComponent':
              const componentData = data.data;
              Builder.addComponent(componentData);
              break;

            case 'builder.blockContentLoading':
              if (typeof data.data.model === 'string') {
                this.blockContentLoading = data.data.model;
              }
              break;

            case 'builder.editingMode':
              const editingMode = data.data;
              if (editingMode) {
                this.editingMode = true;
                document.body.classList.add('builder-editing');
              } else {
                this.editingMode = false;
                document.body.classList.remove('builder-editing');
              }
              break;

            case 'builder.editingPageMode':
              const editingPageMode = data.data;
              Builder.editingPage = editingPageMode;
              break;

            case 'builder.overrideUserAttributes':
              const userAttributes = data.data;
              assign(Builder.overrideUserAttributes, userAttributes);
              this.flushGetContentQueue(true);
              // TODO: refetch too
              break;

            case 'builder.overrideTestGroup':
              const { variationId, contentId } = data.data;
              if (variationId && contentId) {
                this.setTestCookie(contentId, variationId);
                this.flushGetContentQueue(true);
              }
              break;
            case 'builder.evaluate': {
              const text = data.data.text;
              const args = data.data.arguments || [];
              const id = data.data.id;
              // tslint:disable-next-line:no-function-constructor-with-string-args
              const fn = new Function(text);
              let result: any;
              let error: Error | null = null;
              try {
                result = fn.apply(this, args);
              } catch (err) {
                error = toError(err);
              }

              if (error) {
                window.parent?.postMessage(
                  {
                    type: 'builder.evaluateError',
                    data: { id, error: error.message },
                  },
                  '*'
                );
              } else {
                if (result && typeof result.then === 'function') {
                  (result as Promise<any>)
                    .then(finalResult => {
                      window.parent?.postMessage(
                        {
                          type: 'builder.evaluateResult',
                          data: { id, result: finalResult },
                        },
                        '*'
                      );
                    })
                    .catch(console.error);
                } else {
                  window.parent?.postMessage(
                    {
                      type: 'builder.evaluateResult',
                      data: { result, id },
                    },
                    '*'
                  );
                }
              }
              break;
            }
          }
        }
      });
    }
  }

  observersByKey: { [key: string]: BehaviorSubject<BuilderContent[]> | undefined } = {};
  noEditorUpdates: { [key: string]: boolean } = {};

  get defaultCanTrack() {
    return Boolean(
      Builder.isBrowser &&
        navigator.userAgent.trim() &&
        !navigator.userAgent.match(
          /bot|crawler|spider|robot|crawling|prerender|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|phantom|headless|selenium|puppeteer/i
        ) &&
        !this.browserTrackingDisabled
    );
  }

  init(
    apiKey: string,
    canTrack = this.defaultCanTrack,
    req?: IncomingMessage,
    res?: ServerResponse,
    authToken?: string | null,
    apiVersion?: ApiVersion
  ) {
    if (req) {
      this.request = req;
    }
    if (res) {
      this.response = res;
    }
    this.canTrack = canTrack;
    this.apiKey = apiKey;
    if (authToken) {
      this.authToken = authToken;
    }
    if (apiVersion) {
      this.apiVersion = apiVersion;
    }
    return this;
  }

  get previewingModel() {
    const search = this.getLocation().search;
    const params = QueryString.parse((search || '').substr(1));
    return params['builder.preview'];
  }

  // TODO: allow adding location object as property and/or in constructor
  getLocation(): Url {
    let parsedLocation: any = {};

    // in ssr mode
    if (this.request) {
      parsedLocation = parse(this.request.url ?? '');
    } else if (typeof location === 'object') {
      // in the browser
      parsedLocation = parse(location.href);
    }

    // IE11 bug with parsed path being empty string
    // causes issues with our user targeting
    if (parsedLocation.pathname === '') {
      parsedLocation.pathname = '/';
    }

    return parsedLocation;
  }

  getUserAttributes(userAgent = this.userAgent || '') {
    const isMobile = {
      Android() {
        return userAgent.match(/Android/i);
      },
      BlackBerry() {
        return userAgent.match(/BlackBerry/i);
      },
      iOS() {
        return userAgent.match(/iPhone|iPod/i);
      },
      Opera() {
        return userAgent.match(/Opera Mini/i);
      },
      Windows() {
        return userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i);
      },
      any() {
        return (
          isMobile.Android() ||
          isMobile.BlackBerry() ||
          isMobile.iOS() ||
          isMobile.Opera() ||
          isMobile.Windows()
        );
      },
    };

    const isTablet = userAgent.match(/Tablet|iPad/i);

    const url = this.getLocation();

    return {
      urlPath: url.pathname,
      host: url.host || url.hostname,
      // TODO: maybe an option to choose to target off of mobile/tablet/desktop or just mobile/desktop
      device: isTablet ? 'tablet' : isMobile.any() ? 'mobile' : 'desktop',
      ...Builder.overrideUserAttributes,
    } as UserAttributes;
  }

  protected overrides: { [key: string]: string } = {};
  protected queryOptions: { [key: string]: string } = {};

  private getContentQueue: null | GetContentOptions[] = null;
  private priorContentQueue: null | GetContentOptions[] = null;

  setUserAttributes(options: object) {
    assign(Builder.overrideUserAttributes, options);
    this.userAttributesChanged.next(options);
  }

  /**
   * Set user attributes just for tracking purposes.
   *
   * Do this so properties exist on event objects for querying insights, but
   * won't affect targeting
   *
   * Use this when you want to track properties but don't need to target off
   * of them to optimize cache efficiency
   */
  setTrackingUserAttributes(attributes: object) {
    assign(this.trackingUserAttributes, attributes);
  }

  get(
    modelName: string,
    options: GetContentOptions & {
      req?: IncomingMessage;
      res?: ServerResponse;
      apiKey?: string;
      authToken?: string;
    } = {}
  ) {
    let instance: Builder = this;
    if (!Builder.isBrowser) {
      instance = new Builder(
        options.apiKey || this.apiKey,
        options.req,
        options.res,
        undefined,
        options.authToken || this.authToken,
        options.apiVersion || this.apiVersion
      );
      instance.setUserAttributes(this.getUserAttributes());
    } else {
      // NOTE: All these are when .init is not called and the customer
      // directly calls .get on the singleton instance of Builder
      if (options.apiKey && !this.apiKey) {
        this.apiKey = options.apiKey;
      }
      if (options.authToken && !this.authToken) {
        this.authToken = options.authToken;
      }
      if (options.apiVersion && !this.apiVersion) {
        this.apiVersion = options.apiVersion;
      }
    }
    return instance.queueGetContent(modelName, options).map(
      /* map( */ (matches: any[] | null) => {
        const match = matches && matches[0];
        if (Builder.isStatic) {
          return match;
        }

        const matchData = match && match.data;
        if (!matchData) {
          return null;
        }

        if (typeof matchData.blocksString !== 'undefined') {
          matchData.blocks = JSON.parse(matchData.blocksString);
          delete matchData.blocksString;
        }

        return {
          // TODO: add ab test info here and other high level stuff
          data: matchData,
          id: match.id,
          variationId: match.testVariationId || match.variationId || null,
          testVariationId: match.testVariationId || match.variationId || null,
          testVariationName: match.testVariationName || null,
          lastUpdated: match.lastUpdated || null,
        };
      }
    );
    // );
  }

  // TODO: entry id in options
  queueGetContent(modelName: string, options: GetContentOptions = {}) {
    // TODO: if query do modelName + query
    const key =
      options.key ||
      options.alias ||
      // TODO: SDKs only pass entry key when given to them, and never when editing...
      // options.entry ||

      // TODO: this is ugly - instead of multiple of same model with different options are sent
      // say requires key/alias. Or if not perhaps make a reliable hash of the options and use that.
      // TODO: store last user state on last request and if user attributes different now
      // give a warning that need to use keys to request new contente
      // (options &&
      //   Object.keys(options).filter(key => key !== 'model').length &&
      //   JSON.stringify({ model: modelName, ...options, initialContent: undefined })) ||
      modelName;

    const isEditingThisModel = this.editingModel === modelName;
    // TODO: include params in this key........
    const currentObservable = this.observersByKey[key] as BehaviorSubject<BuilderContent[]> | null;

    // if (options.query && options.query._id) {
    //   this.flushGetContentQueue([options])
    // }

    if (this.apiKey === 'DEMO' && !this.overrides[key] && !options.initialContent) {
      options.initialContent = [];
    }

    const { initialContent } = options;

    // TODO: refresh option in options
    if (currentObservable && (!currentObservable.value || options.cache)) {
      // TODO: test if this ran, otherwise on 404 some observers may never be called...
      if (currentObservable.value) {
        nextTick(() => {
          // TODO: return a new observable and only that one fires subscribers, don't refire for existing ones
          currentObservable.next(currentObservable.value);
        });
      }
      return currentObservable;
    }
    if (isEditingThisModel) {
      if (Builder.isBrowser) {
        parent.postMessage({ type: 'builder.updateContent', data: { options } }, '*');
      }
    }
    if (!initialContent /* || isEditingThisModel */) {
      if (!this.getContentQueue) {
        this.getContentQueue = [];
      }

      this.getContentQueue.push({ ...options, model: modelName, key });
      if (this.getContentQueue && this.getContentQueue.length >= this.contentPerRequest) {
        const queue = this.getContentQueue.slice();
        this.getContentQueue = [];
        nextTick(() => {
          this.flushGetContentQueue(false, queue);
        });
      } else {
        nextTick(() => {
          this.flushGetContentQueue();
        });
      }
    }

    const observable = new BehaviorSubject<BuilderContent[]>(null as any);
    this.observersByKey[key] = observable;
    if (options.noEditorUpdates) {
      this.noEditorUpdates[key] = true;
    }
    if (initialContent) {
      nextTick(() => {
        // TODO: need to testModify this I think...?
        observable.next(initialContent);
      });
    }
    return observable;
  }

  // this is needed to satisfy the Angular SDK, which used to rely on the more complex version of `requestUrl`.
  // even though we only use `fetch()` now, we prefer to keep the old behavior and use the `fetch` that comes from
  // the core SDK for consistency
  requestUrl(
    url: string,
    options?: { headers: { [header: string]: number | string | string[] | undefined }; next?: any }
  ) {
    return getFetch()(url, {
      next: { revalidate: 1, ...options?.next },
      ...options,
    } as SimplifiedFetchOptions).then(res => res.json());
  }

  get host() {
    switch (this.env) {
      case 'qa':
        return 'https://qa.builder.io';
      case 'test':
        return 'https://builder-io-test.web.app';
      case 'fast':
        return 'https://fast.builder.io';
      case 'cloud':
        return 'https://cloud.builder.io';
      case 'cdn2':
        return 'https://cdn2.builder.io';
      case 'cdn-qa':
        return 'https://cdn-qa.builder.io';
      case 'development':
      case 'dev':
        return 'http://localhost:5000';
      case 'cdn-prod':
        return 'https://cdn.builder.io';
      default:
        return Builder.overrideHost || 'https://cdn.builder.io';
    }
  }

  private flushGetContentQueue(usePastQueue = false, useQueue?: GetContentOptions[]) {
    if (!this.apiKey) {
      throw new Error(
        `Fetching content failed, expected apiKey to be defined instead got: ${this.apiKey}`
      );
    }

    if (this.apiVersion) {
      if (!['v1', 'v3'].includes(this.apiVersion)) {
        throw new Error(`Invalid apiVersion: expected 'v1' or 'v3', received '${this.apiVersion}'`);
      }
    } else {
      this.apiVersion = DEFAULT_API_VERSION;
    }

    if (!usePastQueue && !this.getContentQueue) {
      return;
    }

    const queue = useQueue || (usePastQueue ? this.priorContentQueue : this.getContentQueue) || [];

    // TODO: do this on every request send?
    this.getOverridesFromQueryString();

    const queryParams: ParamsMap = {
      // TODO: way to force a request to be in a separate queue. or just lower queue limit to be 1 by default
      omit: queue[0].omit || 'meta.componentsUsed',
      apiKey: this.apiKey,
      ...queue[0].options,
      ...this.queryOptions,
    };

    if (queue[0].locale) {
      queryParams.locale = queue[0].locale;
    }
    if (queue[0].fields) {
      queryParams.fields = queue[0].fields;
    }
    if (queue[0].format) {
      queryParams.format = queue[0].format;
    }
    if ('noTraverse' in queue[0]) {
      queryParams.noTraverse = queue[0].noTraverse;
    }
    if ('includeUnpublished' in queue[0]) {
      queryParams.includeUnpublished = queue[0].includeUnpublished;
    }
    if (queue[0].sort) {
      queryParams.sort = queue[0].sort;
    }

    const pageQueryParams: ParamsMap =
      typeof location !== 'undefined'
        ? QueryString.parseDeep(location.search.substr(1))
        : undefined || {}; // TODO: WHAT about SSR (this.request) ?

    const userAttributes =
      // FIXME: HACK: only checks first in queue for user attributes overrides, should check all
      // TODO: merge user attributes provided here with defaults and current user attiributes (?)
      queue && queue[0].userAttributes
        ? queue[0].userAttributes
        : this.targetContent
        ? this.getUserAttributes()
        : {
            urlPath: this.getLocation().pathname,
          };

    const fullUrlQueueItem = queue.find(item => !!item.includeUrl);
    if (fullUrlQueueItem) {
      const location = this.getLocation();
      if (location.origin) {
        queryParams.url = `${location.origin}${location.pathname}${location.search}`;
      }
    }

    const urlQueueItem = useQueue?.find(item => item.url);
    if (urlQueueItem?.url) {
      userAttributes.urlPath = urlQueueItem.url.split('?')[0];
    }
    // TODO: merge in the attribute from query string ones
    // TODO: make this an option per component/request
    queryParams.userAttributes = userAttributes;

    if (!usePastQueue && !useQueue) {
      this.priorContentQueue = queue;
      this.getContentQueue = null;
    }

    const cachebust =
      this.cachebust ||
      isIframe ||
      pageQueryParams.cachebust ||
      pageQueryParams['builder.cachebust'];

    if (cachebust || this.env !== 'production') {
      queryParams.cachebust = true;
    }

    if (Builder.isEditing) {
      queryParams.isEditing = true;
    }

    if (this.noCache || this.env !== 'production') {
      queryParams.noCache = true;
    }

    if (size(this.overrides)) {
      for (const key in this.overrides) {
        if (this.overrides.hasOwnProperty(key)) {
          queryParams[`overrides.${key}`] = this.overrides[key];
        }
      }
    }

    for (const options of queue) {
      if (options.format) {
        queryParams.format = options.format;
      }
      // TODO: remove me and make permodel
      if (options.static) {
        queryParams.static = options.static;
      }

      if (options.cachebust) {
        queryParams.cachebust = options.cachebust;
      }

      if (isPositiveNumber(options.cacheSeconds)) {
        queryParams.cacheSeconds = options.cacheSeconds;
      }

      if (isPositiveNumber(options.staleCacheSeconds)) {
        queryParams.staleCacheSeconds = options.staleCacheSeconds;
      }

      const properties: (keyof GetContentOptions)[] = [
        'prerender',
        'extractCss',
        'limit',
        'offset',
        'query',
        'preview',
        'model',
        'entry',
        'rev',
        'static',
      ];
      for (const key of properties) {
        const value = options[key];
        if (value !== undefined) {
          queryParams.options = queryParams.options || {};
          queryParams.options[options.key!] = queryParams.options[options.key!] || {};
          queryParams.options[options.key!][key] = JSON.stringify(value);
        }
      }
    }
    if (this.preview) {
      queryParams.preview = 'true';
    }
    const hasParams = Object.keys(queryParams).length > 0;

    // TODO: option to force dev or qa api here
    const host = this.host;

    const keyNames = queue.map(item => encodeURIComponent(item.key!)).join(',');

    if (this.overrideParams) {
      const params = omit(QueryString.parse(this.overrideParams), 'apiKey');
      assign(queryParams, params);
    }

    const queryStr = QueryString.stringifyDeep(queryParams);

    const format = queryParams.format;

    const requestOptions = { headers: {}, next: { revalidate: 1 } };
    if (this.authToken) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${this.authToken}`,
      };
    }

    const fn = format === 'solid' || format === 'react' ? 'codegen' : 'query';

    // NOTE: this is a hack to get around the fact that the codegen endpoint is not yet available in v3
    const apiVersionBasedOnFn = fn === 'query' ? this.apiVersion : 'v1';
    const url =
      `${host}/api/${apiVersionBasedOnFn}/${fn}/${this.apiKey}/${keyNames}` +
      (queryParams && hasParams ? `?${queryStr}` : '');

    const promise = getFetch()(url, requestOptions)
      .then(res => res.json())
      .then(
        result => {
          for (const options of queue) {
            const keyName = options.key!;
            if (options.model === this.blockContentLoading && !options.noEditorUpdates) {
              continue;
            }

            const isEditingThisModel = this.editingModel === options.model;
            if (isEditingThisModel && Builder.isEditing) {
              parent.postMessage({ type: 'builder.updateContent', data: { options } }, '*');
              // return;
            }
            const observer = this.observersByKey[keyName];
            if (!observer) {
              return;
            }
            const data = result[keyName];
            const sorted = data; // sortBy(data, item => item.priority);
            if (data) {
              const testModifiedResults = Builder.isServer
                ? sorted
                : this.processResultsForTests(sorted);
              observer.next(testModifiedResults);
            } else {
              const search = this.getLocation().search;
              if ((search || '').includes('builder.preview=' + options.model)) {
                const previewData = {
                  id: 'preview',
                  name: 'Preview',
                  data: {},
                };
                observer.next([previewData]);
              }
              observer.next([]);
            }
          }
        },
        err => {
          for (const options of queue) {
            const observer = this.observersByKey[options.key!];
            if (!observer) {
              return;
            }
            observer.error(err);
          }
        }
      );

    return promise;
  }

  private testCookiePrefix = 'builder.tests';

  private processResultsForTests(results: BuilderContent[]) {
    const mappedResults = results.map(item => {
      if (!item.variations) {
        return item;
      }
      const cookieValue = this.getTestCookie(item.id!);
      const cookieVariation = cookieValue === item.id ? item : item.variations[cookieValue];
      if (cookieVariation) {
        return {
          ...item,
          data: cookieVariation.data,
          variationId: cookieValue,
          testVariationId: cookieValue,
          testVariationName: cookieVariation.name,
        };
      }
      if (this.canTrack && item.variations && size(item.variations)) {
        let n = 0;
        const random = Math.random();
        for (const id in item.variations) {
          const variation = item.variations[id]!;
          const testRatio = variation.testRatio;
          n += testRatio!;
          if (random < n) {
            this.setTestCookie(item.id!, variation.id!);
            const variationName =
              variation.name || (variation.id === item.id ? 'Default variation' : '');
            return {
              ...item,
              data: variation.data,
              variationId: variation.id,
              testVariationId: variation.id,
              variationName: variationName,
              testVariationName: variationName,
            };
          }
        }
        this.setTestCookie(item.id!, item.id!);
      }
      return {
        ...item,
        variationId: item.id,
        ...(item.variations &&
          size(item.variations) && {
            testVariationId: item.id,
            testVariationName: 'Default variation',
          }),
      };
    });

    if (isIframe) {
      window.parent?.postMessage(
        { type: 'builder.contentResults', data: { results: mappedResults } },
        '*'
      );
    }

    return mappedResults;
  }

  private getTestCookie(contentId: string) {
    return this.getCookie(`${this.testCookiePrefix}.${contentId}`);
  }

  private cookieQueue: [string, string][] = [];

  private setTestCookie(contentId: string, variationId: string) {
    if (!this.canTrack) {
      this.cookieQueue.push([contentId, variationId]);
      return;
    }

    // 30 days from now
    const future = new Date();
    future.setDate(future.getDate() + 30);

    return this.setCookie(`${this.testCookiePrefix}.${contentId}`, variationId, future);
  }

  getCookie(name: string): any {
    if (this.cookies) {
      return this.cookies.get(name);
    }
    return Builder.isBrowser && getCookie(name);
  }

  setCookie(name: string, value: any, expires?: Date) {
    if (this.cookies && !(Builder.isServer && Builder.isStatic)) {
      return this.cookies.set(name, value, {
        expires,
        secure: this.getLocation().protocol === 'https:',
      });
    }
    return Builder.isBrowser && setCookie(name, value, expires);
  }

  getContent(modelName: string, options: GetContentOptions = {}) {
    if (!this.apiKey) {
      throw new Error(
        `Fetching content from model ${modelName} failed, expected apiKey to be defined instead got: ${this.apiKey}`
      );
    }
    return this.queueGetContent(modelName, options);
  }

  getAll(
    modelName: string,
    options: GetContentOptions & {
      req?: IncomingMessage;
      res?: ServerResponse;
      apiKey?: string;
      authToken?: string;
    } = {}
  ): Promise<BuilderContent[]> {
    let instance: Builder = this;
    if (!Builder.isBrowser) {
      instance = new Builder(
        options.apiKey || this.apiKey,
        options.req,
        options.res,
        false,
        options.authToken || this.authToken,
        options.apiVersion || this.apiVersion
      );
      instance.setUserAttributes(this.getUserAttributes());
    } else {
      // NOTE: All these are when .init is not called and the customer
      // directly calls .get on the singleton instance of Builder
      if (options.apiKey && !this.apiKey) {
        this.apiKey = options.apiKey;
      }
      if (options.authToken && !this.authToken) {
        this.authToken = options.authToken;
      }
      if (options.apiVersion && !this.apiVersion) {
        this.apiVersion = options.apiVersion;
      }
    }

    // Set noTraverse=true if NOT already passed by user, for query performance
    if (!('noTraverse' in options)) {
      options.noTraverse = true;
    }

    return instance
      .getContent(modelName, {
        limit: 30,
        ...options,
        key:
          options.key ||
          // Make the key include all options, so we don't reuse cache for the same content fetched
          // with different options
          Builder.isBrowser
            ? `${modelName}:${hash(omit(options, 'initialContent', 'req', 'res'))}`
            : undefined,
      })
      .promise();
  }
}
