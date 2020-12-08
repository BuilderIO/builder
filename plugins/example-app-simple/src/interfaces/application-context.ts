import {
  BuilderContent,
  Input,
  BuilderElement,
  Component,
} from '@builder.io/sdk'

type Content = BuilderContent | ContentModel

/**
 * Content model is a wrapped content JSON obejct with some
 * additional methods and a few other differences
 */
interface ContentModel extends BuilderContent {
  // Data is a mobx observable Map and not a plain object for content models
  data: Map<string, any>

  /**
   * If this is a model representing a page, this is the URL
   * assigned to it
   */
  url?: string

  /**
   * A flattened list, good for doing operations on all layers in a builer
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
  allBlocks?: BuilderElement[]
}

export interface ExtendedArray<T = any> extends Array<T> {
  /**
   * Replace the contents of this array with some new JSON
   * and hydrate it
   */
  replace(newArr: T[]): void
  /**
   * Get a raw JSON without proxies or wrapping
   */
  toJSON(): T[]
}

export type Model = {
  id: string
  name: string
  fields: ExtendedArray<Input>
}

export interface HttpCacheValue<ValueType = any> {
  loading: boolean
  value?: ValueType
  error?: any
}

export interface BuilderUser {
  id: string
  email: string
}

export interface ApplicationContext {
  createContent(
    modelName: string,
    data: Partial<BuilderContent>
  ): Promise<BuilderContent>
  user: {
    id: string
    getUser(id: string): Promise<BuilderUser | null>
    listUsers(): Promise<BuilderUser[]>
    authHeaders: { [key: string]: string }
    apiKey: string
    can(
      permissionType: 'editCode' | 'admin' | 'editDesigns' | 'createContent'
    ): boolean
    /**
     * Log the current user out
     */
    signOut(): void
  }
  httpCache: {
    /**
     * Fetch content from an API with basic caching, e.g. for react rerenders
     */
    get<ResponseType = any>(
      url: string,
      options?: RequestInit
    ): HttpCacheValue<ResponseType>
  }
  dialogs: {
    /** Show a simple prompt dialog asking for a text input */
    prompt(options: {
      title?: string
      text?: string
      confirmText?: string
      cancelText?: string
      placeholderText?: string
      defaultValue?: string
    }): Promise<string>
    alert(text: string, title?: string): Promise<null>
  }
  models: {
    result: Model[]
    /**
     * Sync your model updates to the backend (create, edit)
     */
    update(model: Model): Promise<void>
    /**
     * Delete this model for good from the DB
     */
    remove(model: Model): Promise<void>
  }
  content: {
    /**
     * Sync the content entry to the backend (create, edit)
     */
    update(content: Content): Promise<void>
    /**
     * Delete this content entry for good from the DB
     */
    remove(content: Content): Promise<void>
  }
  designerState: {
    editingContentModel: ContentModel | null
    draggingInItem: BuilderElement | Component | string | null
    undo(): Promise<void>
    redo(): Promise<void>
    canUndo: boolean
    canRedo: boolean
    xrayMode: boolean
    editingIframeRef: null | HTMLIFrameElement
    artboardSize: {
      width: number
    }
  }
  builderComponents: Component[]
  contentEditorPage: {
    fullScreenIframe: boolean
    contentEditingMode: boolean
  }
  globalState: {
    /**
     * Show and hide global blocking "Loading..." spinner
     */
    showGlobalBlockingLoading(message?: string): void
    hideGlobalBlockingLoading(): void
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
    openDialog(element: JSX.Element): Promise<() => void>
  }
  location: {
    /**
     * Navigate to a new URL
     *
     * @example location.go('/content')
     */
    go(relativeUrl: string): void

    /**
     * Current url path, e.g. /content/foobar
     */
    pathname: string
  }
}
