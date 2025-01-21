import { TARGET } from '../../constants/target.js';
import { filterWithCustomTargetingScript } from '../../functions/filter-with-custom-targeting.js';
import { isBrowser } from '../../functions/is-browser.js';
import { isEditing } from '../../functions/is-editing.js';
import { USER_ATTRIBUTES_COOKIE_NAME } from '../../helpers/user-attributes.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

export function checkShouldRenderVariants(
  variants: PersonalizationContainerProps['variants'],
  canTrack: boolean
) {
  const hasVariants = variants && variants.length > 0;

  if (TARGET === 'reactNative') return false;

  if (!hasVariants) return false;
  if (!canTrack) return false;

  if (TARGET === 'vue' || TARGET === 'svelte') return true;

  if (isBrowser()) return false;

  return true;
}

export function getBlocksToRender(options: {
  variants: PersonalizationContainerProps['variants'];
  previewingIndex?: number | null;
  isHydrated: boolean;
  filteredVariants: PersonalizationContainerProps['variants'];
  fallbackBlocks?: BuilderBlock[];
}): {
  blocks: BuilderBlock[];
  path: string | undefined;
} {
  const {
    variants,
    previewingIndex,
    isHydrated,
    filteredVariants,
    fallbackBlocks,
  } = options;

  const isPreviewingVariant =
    isHydrated &&
    isEditing() &&
    typeof previewingIndex === 'number' &&
    previewingIndex < (variants?.length || 0) &&
    !filteredVariants?.length;

  // If we're editing a specific variant
  if (isPreviewingVariant) {
    const variant = variants![previewingIndex];
    return {
      blocks: variant.blocks,
      path: `component.options.variants.${previewingIndex}.blocks`,
    };
  }

  const winningVariant = filteredVariants?.[0];
  // Show the variant matching the current user attributes
  if (winningVariant) {
    return {
      blocks: winningVariant.blocks,
      path: `component.options.variants.${variants?.indexOf(winningVariant)}.blocks`,
    };
  }

  // If we're not editing a specific variant or we're on the server and there are no matching variants show the default
  return {
    blocks: fallbackBlocks || [],
    path: undefined,
  };
}

export function getPersonalizationScript(
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) {
  return `
      (function() {
         if (!navigator.cookieEnabled) {
            return;
          } 

        function getCookie(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for(var i=0;i < ca.length;i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') c = c.substring(1,c.length);
              if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
          }
          return null;
        }
        function removeVariants() {
          variants.forEach(function (template, index) {
            document.querySelector('template[data-variant-id="' + "${blockId}-" + index + '"]').remove();
          });
          document.querySelector('script[data-id="variants-script-${blockId}"]').remove();
          document.querySelector('style[data-id="variants-styles-${blockId}"]').remove();
        }

        var attributes = JSON.parse(getCookie("${USER_ATTRIBUTES_COOKIE_NAME}") || "{}");
        ${locale ? `attributes.locale = "${locale}";` : ''}
        var variants = ${JSON.stringify(
          variants?.map((v) => ({
            query: v.query,
            startDate: v.startDate,
            endDate: v.endDate,
          }))
        )};
        var winningVariantIndex = variants.findIndex(function(variant) {
          return filterWithCustomTargeting(
            attributes,
            variant.query,
            variant.startDate,
            variant.endDate
          );
        });
        var isDebug = location.href.includes('builder.debug=true');
        if (isDebug) {
          console.debug('PersonalizationContainer', {
            attributes: attributes,
            variants: variants,
            winningVariantIndex: winningVariantIndex,
            });
        }
        if (winningVariantIndex !== -1) {
          var winningVariant = document.querySelector('template[data-variant-id="' + "${blockId}-" + winningVariantIndex + '"]');
          if (winningVariant) {
            var parentNode = winningVariant.parentNode;
            var newParent = parentNode.cloneNode(false);
            newParent.appendChild(winningVariant.content.firstChild);
            newParent.appendChild(winningVariant.content.lastChild);
            parentNode.parentNode.replaceChild(newParent, parentNode);
            if (isDebug) {
              console.debug('PersonalizationContainer', 'Winning variant Replaced:', winningVariant);
            }
          }
        } else if (variants.length > 0) {
          removeVariants();
        }
        ${filterWithCustomTargetingScript}
      })();
    `.replace(/\s+/g, ' ');
}
