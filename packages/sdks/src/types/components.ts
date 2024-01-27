import type { BuilderElement } from './element.js';
import type { Input } from './input.js';

export interface ComponentInfo {
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

  // TODO (murtaza): Implement 'screenshot' related stuff
  /**
   * Link to a screenshot shown when user hovers over the component in Builder's editor
   * use https://builder.io/upload to upload your screeshot, for easier resizing by Builder.
   */
  screenshot?: string;

  // TODO (murtaza): Implement 'override' related stuff
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
   * Input schema for your component for users to fill in the options
   */
  inputs?: Input[];
  /** @hidden @deprecated */
  class?: any;
  /** @hidden @deprecated */
  type?: 'angular' | 'webcomponent' | 'react' | 'vue';
  /**
   * Default styles to apply when dropped into the Builder.io editor
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
   * TO-DO: make this optional only for RSC SDK.
   *
   * Set this to `true` if your component is a React Server Component (RSC).
   */
  isRSC?: boolean;

  /**
   * Default children
   */
  defaultChildren?: BuilderElement[];
  defaults?: Partial<BuilderElement>;
  /** @hidden @deprecated */
  // eslint-disable-next-line @typescript-eslint/ban-types
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

  // TO-DO: is this used?
  hidden?: boolean;
}

type Permission =
  | 'read'
  | 'publish'
  | 'editCode'
  | 'editDesigns'
  | 'admin'
  | 'create';
