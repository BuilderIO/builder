import type { BuilderElement } from './element';

export interface Input {
  name: string;
  friendlyName?: string;
  description?: string;
  defaultValue?: any;
  type: string;
  valueType?: {
    type?: string;
  };
  required?: boolean;
  autoFocus?: boolean;
  subFields?: Input[];
  helperText?: string;
  allowedFileTypes?: string[];
  imageHeight?: number;
  imageWidth?: number;
  mediaHeight?: number;
  mediaWidth?: number;
  hideFromUI?: boolean;
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
  options?: { [key: string]: any };
  enum?: string[] | { label: string; value: any; helperText?: string }[];
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
  advanced?: boolean;
  onChange?: ((options: Map<string, any>) => void | Promise<void>) | string;
  code?: boolean;
  richText?: boolean;
  showIf?: ((options: Map<string, any>) => boolean) | string;
  copyOnAdd?: boolean;
}

export interface ComponentInfo {
  /**
   * Name your component something unique, e.g. 'MyButton'. You can override built-in components
   * by registering a component with the same name, e.g. 'Text', to replace the built-in text component
   */
  name: string;
  description?: string;
  /**
   * Link to a documentation page for this component
   */
  docsLink?: string;
  image?: string;
  /**
   * Input schema for your component for users to fill in the options
   */
  inputs?: Input[];
  class?: any;
  type?: 'angular' | 'webcomponent' | 'react' | 'vue';
  defaultStyles?: { [key: string]: string };
  /**
   * Turn on if your component can accept children. Be sure to use in combination with
   * withChildren(YourComponent) like here
   * github.com/BuilderIO/builder/blob/master/examples/react-design-system/src/components/HeroWithChildren/HeroWithChildren.builder.js#L5
   */
  canHaveChildren?: boolean;
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
  defaults?: Partial<BuilderElement>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  hooks?: { [key: string]: string | Function };
  /**
   * Hide your component in editor, useful for gradually deprecating components
   */
  hideFromInsertMenu?: boolean;
  // For webcomponents
  tag?: string;
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

  /** not yet implemented */
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
