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
  options?: {
    [key: string]: any;
  };
  /**
   * For "text" input type, specifying an enum will show a dropdown of options instead
   */
  enum?:
    | string[]
    | {
        label: string;
        value: any;
        helperText?: string;
      }[];
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
  // onChange?: Function | string;
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
