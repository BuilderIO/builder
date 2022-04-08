import { BuilderContent, Input, BuilderElement, Component } from '@builder.io/sdk';
import React from 'react';
type Content = BuilderContent | ContentModel;

/**
 * Content model is a wrapped content JSON object with some
 * additional methods and a few other differences
 */
interface ContentModel extends BuilderContent {
  // Data is a mobx observable Map and not a plain object for content models
  data: Map<string, any>;

  /**
   * If this is a model representing a page, this is the URL
   * assigned to it
   */
  url?: string;

  /**
   * A flattened list, good for doing operations on all layers in a builder
   * page or content
   *
   * @example
   *    context.designerState.editingContentModel.allBlocks.forEach(block => {
   *      // Do some operation on all layers, e.g.
   *      if (block.component?.name === 'image') {
   *        block.component.options.set('lazy', true)
   *      }
   *    })
   */
  allBlocks?: BuilderElement[];
}

export interface ExtendedArray<T = any> extends Array<T> {
  /**
   * Replace the contents of this array with some new JSON
   * and hydrate it
   */
  replace(newArr: T[]): void;
  /**
   * Get a raw JSON without proxies or wrapping
   */
  toJSON(): T[];
}

export type Model = {
  id: string;
  name: string;
  fields: ExtendedArray<Input>;
};

export type RoleOption = 'read' | 'publish' | 'editCode' | 'editDesigns' | 'admin' | 'create';

export type Action = {
  /**
   * Friendly name for an action, e.g. "Set State"
   */
  name: string;

  /**
   * Globally unique ID for an action, e.g. "@builder.io:setState"
   */
  id: string;

  /**
   * Function to turn the provided options into a string of code
   *
   * e.g.
   *    toJs: options => `state.${camelCase(options.name)} = ${JSON.stringify(options.value)};`,
   */
  toJs: (options: Record<string, any>) => string;

  /**
   * Friendly helper text describing the action in the UIs
   */
  helperText?: string | React.ReactNode;

  /**
   * Link to learn more about how to use this action
   */
  learnMoreLink?: string;

  /**
   * Inputs this action takes. Aka function arguments
   */
  inputs: () => Input[];

  /**
   * Is an action for expression (e.g. calculating a binding like a formula
   * to fill a value based on locale) or a function (e.g. something to trigger
   * on an event like add to cart) or either (e.g. a custom code block)
   */
  kind: 'expression' | 'function' | 'any';

  /**
   * Require certain permissions to create or edit this action
   * type, e.g. require 'editCode' permissions to create or edit
   * 'custom code' actions
   */
  requiredPermissions?: RoleOption;

  icon?: React.ReactNode;
};

export interface HttpCacheValue<ValueType = any> {
  loading: boolean;
  value?: ValueType;
  error?: any;
}

export interface BuilderUser {
  id: string;
  email: string;
}

export interface ApplicationContext {
  createContent(modelName: string, data: Partial<BuilderContent>): Promise<BuilderContent>;
  user: {
    id: string;
    getUser(id: string): Promise<BuilderUser | null>;
    listUsers(): Promise<BuilderUser[]>;
    authHeaders: { [key: string]: string };
    apiKey: string;
    can(permissionType: 'editCode' | 'admin' | 'editDesigns' | 'createContent'): boolean;
    /**
     * Log the current user out
     */
    signOut(): void;
  };
  httpCache: {
    /**
     * Fetch content from an API with basic caching, e.g. for react re-renders
     */
    get<ResponseType = any>(url: string, options?: RequestInit): HttpCacheValue<ResponseType>;
  };
  dialogs: {
    /** Show a simple prompt dialog asking for a text input */
    prompt(options: {
      title?: string;
      text?: string;
      confirmText?: string;
      cancelText?: string;
      placeholderText?: string;
      defaultValue?: string;
    }): Promise<string>;
    alert(text: string, title?: string): Promise<null>;
  };
  models: {
    result: Model[];
    /**
     * Sync your model updates to the backend (create, edit)
     */
    update(model: Model): Promise<void>;
    /**
     * Delete this model for good from the DB
     */
    remove(model: Model): Promise<void>;
  };
  content: {
    /**
     * Sync the content entry to the backend (create, edit)
     */
    update(content: Content): Promise<void>;
    /**
     * Delete this content entry for good from the DB
     */
    remove(content: Content): Promise<void>;
  };
  designerState: {
    editingContentModel: ContentModel | null;
    draggingInItem: BuilderElement | Component | string | null;
    undo(): Promise<void>;
    redo(): Promise<void>;
    canUndo: boolean;
    canRedo: boolean;
    xrayMode: boolean;
    /**
     * Creates a checkpoint from editing content state
     */
    createCheckpoint: () => Promise<void>;
    /**
     * returns whether editing content has unsaved changes
     */
    hasUnsavedChanges: () => boolean;
    editingIframeRef: null | HTMLIFrameElement;
    artboardSize: {
      width: number;
    };
  };
  builderComponents: Component[];
  contentEditorPage: {
    fullScreenIframe: boolean;
    contentEditingMode: boolean;
  };
  globalState: {
    /**
     * Show and hide global blocking "Loading..." spinner
     */
    showGlobalBlockingLoading(message?: string): void;
    hideGlobalBlockingLoading(): void;
    /**
     * Open a dialog
     *
     * @example
     *   const close = globalState.openDialog(
     *      <div onClick={() => close()}>
     *        Hello!
     *      </div>
     *   )
     * @returns a promise that resolves to a function to close the dialogs
     */
    openDialog(element: any): Promise<() => void>;
  };
  location: {
    /**
     * Navigate to a new URL
     *
     * @example location.go('/content')
     */
    go(relativeUrl: string): void;

    /**
     * Current url path, e.g. /content/foobar
     */
    pathname: string;
  };
  registerAction: (action: Action) => void;
}

declare const context: ApplicationContext;

export default context;
