const REPLACE_CONTENT_ID = 'REPLACE_CONTENT_ID';
const REPLACE_VARIANTS_JSON = 'REPLACE_VARIANTS_JSON';

type VariantData = {
  id: string;
  testRatio?: number;
};

const variantScriptFn = function () {
  // TO-DO: redundant check?
  if (!navigator.cookieEnabled) {
    return;
  }

  const contentId = REPLACE_CONTENT_ID as unknown as string;
  const variants = REPLACE_VARIANTS_JSON as unknown as VariantData[];

  const templateSelectorById = (id: string) =>
    `template[data-template-variant-id="${id}"]`;

  function removeVariants() {
    // remove each variant
    variants.forEach((template) => {
      const el = document.querySelector(templateSelectorById(template.id));
      if (el) {
        el.remove();
      }
    });
    // remove this script itself
    const el = document.getElementById(`variants-script-${contentId}`);
    if (el) {
      el.remove();
    }
  }

  // TO-DO: what is this check doing?
  // seems like a template polyfill check
  if (typeof document.createElement('template').content === 'undefined') {
    removeVariants();
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
  const cookieName = `builder.tests.${contentId}`;
  const variantInCookie = getCookie(cookieName);
  const availableIDs = variants.map((vr) => vr.id).concat(contentId);

  function getAndSetVariantId(): string {
    // cookie already exists
    if (variantInCookie && availableIDs.indexOf(variantInCookie) > -1) {
      return variantInCookie;
    }

    // no cookie exists, find variant
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

    // no variant found, assign default content
    setCookie(cookieName, contentId);
    return contentId;
  }
  const variantId = getAndSetVariantId();

  if (variantId !== contentId) {
    const winningTemplate = document.querySelector<HTMLTemplateElement>(
      templateSelectorById(variantId)
    );
    if (!winningTemplate) {
      return;
    }

    /**
     * grandparent
     *   -> parent
     *    -> template1
     *      -> builder-content
     *    -> template2
     *
     * grandparent
     *  -> parent
     *   -> builder-content
     *
     *
     *
     */

    const templatesParent = winningTemplate.parentNode;
    const winningBuilderContent = winningTemplate.content.firstChild;
    if (templatesParent) {
      // shallow clone template parent, and replace all children with winning template content
      const newParent = templatesParent.cloneNode(false);
      newParent.appendChild(winningBuilderContent!);

      // replace template parent with new parent
      templatesParent.parentNode!.replaceChild(newParent, templatesParent);
    }
  } else if (variants.length > 0) {
    removeVariants();
  }
};

export const getVariantsScriptString = (
  variants: VariantData[],
  contentId: string
) =>
  variantScriptFn
    .toString()
    .replace(REPLACE_CONTENT_ID, contentId)
    .replace(REPLACE_VARIANTS_JSON, JSON.stringify(variants))
    .replace(/\s+/g, ' ');
