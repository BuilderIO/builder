/**
 * WARNING: This file contains functions that get stringified and inlined into the HTML at build-time.
 * They cannot import anything.
 */

/**
 * Global Builder context singleton to store and retrieve Builder configuration
 * across the application without prop drilling.
 */

export interface GlobalBuilderContext {
  apiKey?: string;
  apiHost?: string;
  contentId?: string;
}

// Define the global Builder object structure
interface GlobalBuilder {
  globalContext: GlobalBuilderContext;
  setContext: (context: GlobalBuilderContext) => void;
  getContext: () => GlobalBuilderContext;
  getValue: <K extends keyof GlobalBuilderContext>(
    key: K
  ) => GlobalBuilderContext[K];
  clearContext: () => void;
}

/**
 * Initialize the GlobalBuilderContext on the global/window object
 * This function sets up the Builder context functions globally
 */
export function initializeGlobalBuilderContext(): void {
  // Detect environment and get the appropriate global object
  const isServer = typeof window === 'undefined';
  const globalObject = isServer
    ? typeof globalThis !== 'undefined'
      ? globalThis
      : (function () {
          try {
            return global;
          } catch (e) {
            return {};
          }
        })()
    : window;

  if ((globalObject as any).GlobalBuilderContext) {
    // if already exists, don't re-initialize
    return;
  }

  /**
   * Singleton instance to store the global Builder context
   */
  const globalContext: GlobalBuilderContext = {};
  /**
   * Set the global Builder context
   * @param context - The context values to set
   */
  function setGlobalBuilderContext(
    this: any,
    context: GlobalBuilderContext
  ): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Get the global Builder context
   * @returns The current global Builder context
   */
  function getGlobalBuilderContext(this: any): GlobalBuilderContext {
    return this.globalContext;
  }

  /**
   * Get a specific value from the global Builder context
   * @param key - The key to retrieve
   * @returns The value for the specified key
   */
  function getGlobalBuilderValue<K extends keyof GlobalBuilderContext>(
    this: any,
    key: K
  ): GlobalBuilderContext[K] {
    return this.globalContext[key];
  }

  /**
   * Clear the global Builder context
   */
  function clearGlobalBuilderContext(this: any): void {
    this.globalContext = {};
  }

  // Attach Builder functions to the global object
  if (globalObject) {
    (globalObject as any).GlobalBuilderContext =
      (globalObject as any).GlobalBuilderContext || {};
    const globalBuilderContext = (globalObject as any)
      .GlobalBuilderContext as GlobalBuilder;
    globalBuilderContext.globalContext = globalContext;

    globalBuilderContext.setContext = setGlobalBuilderContext;
    globalBuilderContext.getContext = getGlobalBuilderContext;
    globalBuilderContext.getValue = getGlobalBuilderValue;
    globalBuilderContext.clearContext = clearGlobalBuilderContext;
  }
}
type VariantData = {
  id: string;
  testRatio?: number;
};

/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/src/SSR_AB_TEST.md)
 */
function updateCookiesAndStyles(
  contentId: string,
  variants: VariantData[],
  isHydrationTarget: boolean,
  isAngularSDK: boolean
) {
  function getAndSetVariantId(): string {
    function setCookie(name: string, value: string, days?: number) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie =
        name +
        '=' +
        (value || '') +
        expires +
        '; path=/' +
        '; Secure; SameSite=None';
    }

    function parseUrlParams(url: string): Map<string, string> {
      const result = new Map<string, string>();

      try {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;

        for (const [key, value] of params) {
          result.set(key, value);
        }
      } catch (error) {
        console.debug('Error parsing URL parameters:', error);
      }

      return result;
    }
    function getVariantIdFromUrl() {
      if (typeof window === 'undefined') return;
      const testCookiePrefix = 'builder.tests';
      try {
        // Use native URL object to parse current page URL
        const params = parseUrlParams(window.location.href);

        // Look for parameters that start with 'builder.tests.'
        for (const [key, value] of params) {
          if (key.startsWith(`${testCookiePrefix}.${contentId}`)) {
            return [key, value];
          }
        }
        return;
      } catch (e) {
        console.debug('Error parsing tests from URL', e);
        return;
      }
    }
    const builderTestQueryParam = getVariantIdFromUrl();
    if (builderTestQueryParam) {
      const [key, value] = builderTestQueryParam;
      setCookie(key, value, 30);
    }

    function getCookie(name: string) {
      const nameEQ = name + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
          return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
    const cookieName = `builder.tests.${contentId}`;
    const variantInCookie = getCookie(cookieName);
    const availableIDs = variants.map((vr) => vr.id).concat(contentId);
    /**
     * cookie already exists
     */
    if (variantInCookie && availableIDs.includes(variantInCookie)) {
      return variantInCookie;
    }

    /**
     * no cookie exists, find variant
     */
    let n = 0;
    const random = Math.random();
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const testRatio = variant.testRatio;
      n += testRatio!;
      if (random < n) {
        setCookie(cookieName, variant.id);
        return variant.id;
      }
    }

    /**
     * no variant found, assign default content
     */
    setCookie(cookieName, contentId);

    return contentId;
  }

  const winningVariantId = getAndSetVariantId();

  let styleEl = document.currentScript
    ?.previousElementSibling as HTMLStyleElement;

  if (isAngularSDK) {
    /**
     * Angular SDK uses a different DOM structure, so we need to find the style element differently
     * styles are inside - <inlined-styles> <style> ... </style></inlined-styles>
     */
    styleEl =
      document.currentScript?.parentElement?.previousElementSibling?.querySelector(
        'style'
      ) as HTMLStyleElement;
  }

  /**
   * For React to work, we need hydration to match SSR, so we completely remove this node and the styles tag.
   */
  if (isHydrationTarget) {
    styleEl.remove();
    const thisScriptEl = document.currentScript;
    thisScriptEl?.remove();
  } else {
    /* update styles to hide all variants except the winning variant */
    const newStyleStr = variants
      .concat({ id: contentId })
      .filter((variant) => variant.id !== winningVariantId)
      .map((value) => {
        return `.variant-${value.id} {  display: none; }
        `;
      })
      .join('');

    styleEl.innerHTML = newStyleStr;
  }
}

/**
 * For more information on how this works,
 * see our [SSR A/B Test Docs](https://github.com/BuilderIO/builder/tree/main/packages/sdks/docs/SSR_AB_TEST.md)
 */
function updateVariantVisibility(
  variantContentId: string,
  defaultContentId: string,
  isHydrationTarget: boolean
) {
  if (!navigator.cookieEnabled) {
    return;
  }

  function getCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  const cookieName = `builder.tests.${defaultContentId}`;
  const winningVariant = getCookie(cookieName);

  const parentDiv = document.currentScript?.parentElement;

  const isDefaultContent = variantContentId === defaultContentId;
  const isWinningVariant = winningVariant === variantContentId;

  /**
   * For all frameworks, we need to:
   *  - make the winning (non-default) variant visible.
   *  - hide the non-winning variants.
   *
   * Technically, the second step is redundant in hydration frameworks,
   * as we delete the entire content at the end of this script.
   * However, this vastly simplifies the logic.
   */
  if (isWinningVariant && !isDefaultContent) {
    parentDiv?.removeAttribute('hidden');
    parentDiv?.removeAttribute('aria-hidden');
  } else if (!isWinningVariant && isDefaultContent) {
    parentDiv?.setAttribute('hidden', 'true');
    parentDiv?.setAttribute('aria-hidden', 'true');
  }

  if (isHydrationTarget) {
    /**
     * For Hydration frameworks, we need to remove the node if it's not the winning variant.
     */
    if (!isWinningVariant) {
      parentDiv?.remove();
    }

    /**
     * For Hydration frameworks, we need to remove this script tag as it doesn't render in CSR.
     */
    const thisScriptEl = document.currentScript;
    thisScriptEl?.remove();
  }
  return;
}

export const UPDATE_COOKIES_AND_STYLES_SCRIPT = updateCookiesAndStyles
  .toString()
  .replace(/\s+/g, ' ');
export const UPDATE_VARIANT_VISIBILITY_SCRIPT = updateVariantVisibility
  .toString()
  .replace(/\s+/g, ' ');
export const SETUP_GLOBAL_BUILDER_CONTEXT_SCRIPT =
  initializeGlobalBuilderContext.toString().replace(/\s+/g, ' ');
