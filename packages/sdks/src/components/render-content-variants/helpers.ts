import { isBrowser } from '../../functions/is-browser';
import type { Nullable } from '../../helpers/nullable';
import type { BuilderContent } from '../../types/builder-content';

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

const variantScriptFn = function main(
  contentId: string,
  variants: VariantData[]
) {
  console.log('hey variant script', JSON.stringify({ contentId, variants }));

  const templateSelectorById = (id: string) =>
    `template[data-template-variant-id="${id}"]`;

  function removeTemplates() {
    console.log('Removing variants');
    /**
     * remove each variant
     */
    variants.forEach((template) => {
      const el = document.querySelector(templateSelectorById(template.id));
      if (el) {
        console.log('Removing variant', template.id);
        el.remove();
      }
    });

    /**
     * remove this script itself
     */
    const el = document.getElementById(`variants-script-${contentId}`);
    if (el) {
      console.log('Removing variant script');
      el.remove();
    }
  }

  /**
   * TO-DO: redundant check?
   */
  if (!navigator.cookieEnabled) {
    console.log('Cookies are disabled, skipping variant script');
    removeTemplates();
    return;
  }

  /**
   * TO-DO: what is this check doing?
   * seems like a template polyfill check
   */
  if (typeof document.createElement('template').content === 'undefined') {
    console.log('Template polyfill not found, skipping variant script');
    removeTemplates();
    return;
  }

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
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function getAndSetVariantId(): string {
    const cookieName = `builder.tests.${contentId}`;
    const variantInCookie = getCookie(cookieName);
    const availableIDs = variants.map((vr) => vr.id).concat(contentId);
    /**
     * cookie already exists
     */
    if (variantInCookie && availableIDs.indexOf(variantInCookie) > -1) {
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
  const variantId = getAndSetVariantId();

  if (variantId !== contentId) {
    console.log('Variant found', variantId);
    const winningTemplate = document.querySelector<HTMLTemplateElement>(
      templateSelectorById(variantId)
    );
    console.log('winningTemplate', winningTemplate);
    if (!winningTemplate) {
      console.log('No template found for variant', variantId);
      console.log('selector: ', templateSelectorById(variantId));
      return;
    }

    const templatesParent = winningTemplate.parentNode!;
    /**
     * Create a shallow clone of the parent of all templates (and the default content)
     */
    const newParent = templatesParent.cloneNode(false);

    /**
     * Append only the winning variant to the new parent
     */
    newParent.appendChild(winningTemplate.content.firstElementChild!);

    /**
     * Replace the old parent with the new one.
     *
     * NOTE: replacing the old parent with the new one means that any other children of that parent will be removed.
     *
     * ```jsx
     *  <div>
     *    <div>
     *      <h1>Page Title</h1>
     *      <RenderContentVariants />
     *      <footer>Footer Content</foote>
     *    </div>
     *  </div>
     * ```
     *
     * Since `RenderContentVariants will replace its parent, the rest of the content will be removed.
     */
    templatesParent.parentNode!.replaceChild(newParent, templatesParent);

    /**
       * TO-DO:
       * - figure out why this isn't even running in the react example
       * - then test that it does work correctly
       * - then look into hydration mismatch in nextjs
       

      * OLD CODE THAT DOESNT WORK
      * console.log('Replacing templates parent with winning template');
      * * shallow clone template parent, and replace all children with winning template content
      * const newParent = templatesParent.cloneNode(false);
      * console.log('templatesParent', templatesParent);
      * console.log('newParent', newParent);
      * newParent.appendChild(winningBuilderContent!);

      * console.log('newParent after transform', newParent);
      * console.log('parentNode before', templatesParent.parentNode.html);
      * * replace template parent with new parent
      * templatesParent.parentNode!.replaceChild(newParent, templatesParent);
      * console.log('parentNode after', templatesParent.parentNode);
      */
  } else if (variants.length > 0) {
    console.log('No variant found, removing all variants');
  }
  removeTemplates();
  console.log('Variant script complete');
};

export const getVariantsScriptString = (
  variants: VariantData[],
  contentId: string
) => {
  const fnStr = variantScriptFn.toString().replace(/\s+/g, ' ');

  return `
  ${fnStr}
  main("${contentId}", ${JSON.stringify(variants)})
  `;
};
