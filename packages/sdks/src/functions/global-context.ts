/**
 * Global Builder context singleton to store and retrieve Builder configuration
 * across the application without prop drilling.
 */

export interface GlobalBuilderContext {
  apiKey?: string;
  apiHost?: string;
  contentId?: string;
}

/**
 * Singleton instance to store the global Builder context
 */
class BuilderGlobalContext {
  private static instance: BuilderGlobalContext;
  private context: GlobalBuilderContext = {};

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): BuilderGlobalContext {
    if (!BuilderGlobalContext.instance) {
      BuilderGlobalContext.instance = new BuilderGlobalContext();
    }
    return BuilderGlobalContext.instance;
  }

  /**
   * Set the global context values
   */
  public setContext(context: GlobalBuilderContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get the current global context
   */
  public getContext(): GlobalBuilderContext {
    return { ...this.context };
  }

  /**
   * Clear the global context
   */
  public clearContext(): void {
    this.context = {};
  }

  /**
   * Get a specific value from the context
   */
  public getValue<K extends keyof GlobalBuilderContext>(
    key: K
  ): GlobalBuilderContext[K] {
    return this.context[key];
  }
}

/**
 * Set the global Builder context
 * @param context - The context values to set
 */
export function setGlobalBuilderContext(context: GlobalBuilderContext): void {
  BuilderGlobalContext.getInstance().setContext(context);
}

/**
 * Get the global Builder context
 * @returns The current global Builder context
 */
export function getGlobalBuilderContext(): GlobalBuilderContext {
  return BuilderGlobalContext.getInstance().getContext();
}

/**
 * Get a specific value from the global Builder context
 * @param key - The key to retrieve
 * @returns The value for the specified key
 */
export function getGlobalBuilderValue<K extends keyof GlobalBuilderContext>(
  key: K
): GlobalBuilderContext[K] {
  return BuilderGlobalContext.getInstance().getValue(key);
}

/**
 * Clear the global Builder context
 */
export function clearGlobalBuilderContext(): void {
  BuilderGlobalContext.getInstance().clearContext();
}
