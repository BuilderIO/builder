import { TARGET } from '../../constants/target';
import { isBrowser } from '../../functions/is-browser';
import type { Nullable } from '../../helpers/nullable';
import type { BuilderContent } from '../../types/builder-content';
import type { Target } from '../../types/targets';

export const checkShouldRunVariants = ({
  canTrack,
  content,
}: {
  canTrack: Nullable<boolean>;
  content: Nullable<BuilderContent>;
}) => {
  const hasVariants = Object.keys(content?.variations || {}).length > 0;

  if (!hasVariants) {
    return false;
  }

  if (!canTrack) {
    return false;
  }

  if (isBrowser()) {
    return false;
  }

  return true;
};

type VariantData = {
  id: string;
  testRatio?: number;
};

/**
 * NOTE: when this function is stringified, single-line comments can cause weird issues when compiled by Sveltekit.
 * Make sure to write multi-line comments only.
 */
const variantScriptFn = function main(
  contentId: string,
  variants: VariantData[],
  target: Target
) {
  function templateSelectorById(id: string) {
    return `template[data-template-variant-id="${id}"]`;
  }

  function removeTemplatesAndScript() {
    variants.forEach((template) => {
      const el = document.querySelector(templateSelectorById(template.id));
      if (el) {
        el.remove();
      }
    });

    const el = document.getElementById(`variants-script-${contentId}`);
    if (el) {
      el.remove();
    }
  }

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
  /**
   * Replace the old parent with the new one.
   *
   * NOTE: replacing the old parent with the new one means that any other children of that parent will be removed.
   *
   * ```jsx
   *  <div>                               <-- templatesParent.parentNode
   *    <div>                             <-- templatesParent
   *      <h1>Page Title</h1>             <-- will disappear?
   *      <RenderContentVariants>
   *        <style>
   *          .a { display: none; }
   *          .c { display: none; }
   *          .default { display: none; }
   *        </style>
   *        <div class="a" hidden>A</div>
   *        <div class="b" hidden>B</div>
   *        <div class="c" hidden>C</div>
   *        <script />                    <-- this script
   *        <div class="default">Default Content</div>
   *      </RenderContentVariants>
   *      <footer>Footer Content</foote>  <-- will disappear?
   *    </div>
   *  </div>
   * ```
   *
   * ```jsx
   *  <div>
   *    <div>B</div>
   *  </div>
   * ```
   *
   * Since `RenderContentVariants will replace its parent, the rest of the content will be removed.
   */
  function injectVariantTemplate() {
    if (!navigator.cookieEnabled) {
      return;
    }

    /**
     * TO-DO: what is this check doing?
     * seems like a template polyfill check
     */
    if (typeof document.createElement('template').content === 'undefined') {
      return;
    }

    const variantId = getAndSetVariantId();

    if (variantId === contentId) {
      return;
    }

    const winningTemplate = document.querySelector<HTMLTemplateElement>(
      templateSelectorById(variantId)
    );

    if (!winningTemplate) {
      /**
       * TO-DO: what do in this case? throw? warn?
       */
      return;
    }

    const templatesParent = winningTemplate.parentNode!;
    const newParent = templatesParent.cloneNode(false);
    newParent.appendChild(winningTemplate.content.firstElementChild!);

    templatesParent.parentNode!.replaceChild(newParent, templatesParent);
  }

  function handleQwik() {
    /**
     *  If we are using Qwik, then we don't want to remove any elements. Instead:
     *    - we don't wrap anything in `template`
     *    - we give every RenderContent a className unique to it
     *    - on the server, we set `display: none` and `hidden` attrs for all variants except default
     *
     *  Then, on the client, this blocking script will:
     *    - choose the winning variant
     *      - if it's the default one, do nothing
     *      - if it's a variant, then
     *        - make the variant visible by tweaking its CSS to `display: visible`
     *        - make the default content invisible by tweaking its CSS
     *
     *
     */
    if (!navigator.cookieEnabled) {
      return;
    }

    /**
     * TO-DO: what is this check doing?
     * seems like a template polyfill check
     */
    if (typeof document.createElement('template').content === 'undefined') {
      return;
    }

    const variantId = getAndSetVariantId();

    if (variantId === contentId) {
      return;
    }

    const newStyleStr = variants
      .concat({ id: contentId })
      .filter((variant) => variant.id !== variantId)
      .map((value) => {
        return `.variant-${value.id} {  display: none; }
        `;
      })
      .join('');

    const styleEl = document.getElementById(
      `variants-styles-${contentId}`
    ) as HTMLStyleElement;

    // check if this actually updates the style
    styleEl.innerHTML = newStyleStr;

    // then, we need to make the HTML changes...which we can't do if the script is blocking before the HTML tags?
    // is CSS sufficient to hide content rendering-, a11y- and SEO-wise?
    // if not, I dont think we can use HTML, unless there's a way to batch DOM changes. If there is, then we can batch
    // the following changes:
    //  - set `hidden` HTML attr to default content
    //  - remove `hidden` HTML attr from winning variant
    // If not...we can probably do this in qwik?

    return;
  }

  if (target !== 'qwik') {
    injectVariantTemplate();
    removeTemplatesAndScript();
  } else {
    injectVariantTemplate();
    removeTemplatesAndScript();
    // handleQwik();
  }
};

/**
 *
 * <div hidden=true aria-hidden=true style="display: none;">Some Content</div>
 *
 * we have hidden=true attr set to all templates. We need to:
 *
 * - remove the `hidden=true` attr from the winning variant
 * - add the `hidden=true` attr to the default content ---> how do I do that??
 */

export const getVariantsScriptString = (
  variants: VariantData[],
  contentId: string
) => {
  const fnStr = variantScriptFn.toString().replace(/\s+/g, ' ');

  return `
  ${fnStr}
  main("${contentId}", ${JSON.stringify(variants)}, "${TARGET}")
  `;
};
