import { filterWithCustomTargetingScript } from '../../functions/filter-with-custom-targeting';
import { USER_ATTRIBUTES_COOKIE_NAME } from '../../helpers/user-attributes';
import type { PersonalizationContainerProps } from './personalization-container.types';
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
            console.log("removing variant", "${blockId}-" + index);
            document.querySelector('template[data-variant-id="' + "${blockId}-" + index + '"]').remove();
          });
          console.log("removing variants script");
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
          console.log("winningVariant", winningVariant);
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
