import type { BuilderContentVariation } from '../../types/builder-content';

export function getData(content: BuilderContentVariation) {
  if (typeof content?.data === 'undefined') {
    return undefined;
  }

  const { blocks, blocksString } = content.data;
  const hasBlocks = Array.isArray(blocks) || typeof blocksString === 'string';
  const newData: any = {
    ...content.data,
    ...(hasBlocks && { blocks: blocks || JSON.parse(blocksString) }),
  };

  delete newData.blocksString;
  return newData;
}

const REPLACE_CONTENT_ID = 'REPLACE_CONTENT_ID';
const REPLACE_VARIANTS_JSON = 'REPLACE_VARIANTS_JSON';

type Variant = {
  id: string;
  testRatio?: number;
};

const variantScriptFn = function () {
  // TO-DO: fix Builder noTrack check
  if (window.builderNoTrack || !navigator.cookieEnabled) {
    return;
  }

  const contentId = REPLACE_CONTENT_ID as unknown as string;
  const variants = REPLACE_VARIANTS_JSON as unknown as Variant[];

  const templateSelectorById = (id: string) =>
    `template[data-template-variant-id="${id}"]`;

  function removeVariants() {
    variants.forEach(function (template) {
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
  let variantId;
  if (availableIDs.indexOf(variantInCookie) > -1) {
    variantId = variantInCookie;
  }
  if (!variantId) {
    let n = 0;
    const random = Math.random();
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const testRatio = variant.testRatio;
      n += testRatio;
      if (random < n) {
        setCookie(cookieName, variant.id);
        variantId = variant.id;
        break;
      }
    }
    if (!variantId) {
      variantId = contentId;
      setCookie(cookieName, contentId);
    }
  }
  if (variantId && variantId !== contentId) {
    const winningTemplate = document.querySelector<HTMLTemplateElement>(
      templateSelectorById(variantId)
    );
    if (winningTemplate) {
      const parentNode = winningTemplate.parentNode;
      if (parentNode && winningTemplate.content.firstChild) {
        const newParent = parentNode.cloneNode(false);
        newParent.appendChild(winningTemplate.content.firstChild);

        if (parentNode.parentNode) {
          parentNode.parentNode.replaceChild(newParent, parentNode);
        }
      }
    }
  } else if (variants.length > 0) {
    removeVariants();
  }
};

export const getVariantsScriptString = (
  variants: Variant[],
  contentId: string
) =>
  variantScriptFn
    .toString()
    .replace(REPLACE_CONTENT_ID, contentId)
    .replace(REPLACE_VARIANTS_JSON, JSON.stringify(variants))
    .replace(/\s+/g, ' ');
