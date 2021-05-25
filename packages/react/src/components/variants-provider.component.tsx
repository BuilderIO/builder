import * as React from 'react';
import { builder, Builder, BuilderContent, BuilderContentVariation } from '@builder.io/sdk';

function getData(content: BuilderContentVariation) {
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

const variantsScript = (variantsString: string, contentId: string) =>
  `
(function() {
  if (window.builderNoTrack) {
    return;
  }

  var variants = ${variantsString};
  function removeVariants() {
    variants.forEach(function (template) {
      document.querySelector('template[data-template-variant-id="' + template.id + '"]').remove();
    });
  }

  if (typeof document.createElement("template").content === 'undefined') {
    removeVariants();
    return ;
  }

  function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/" + "; Secure; SameSite=None";
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
  var cookieName = 'builder.tests.${contentId}';
  var variantInCookie = getCookie(cookieName);
  var availableIDs = variants.map(function(vr) { return vr.id }).concat('${contentId}');
  var variantId;
  if (availableIDs.indexOf(variantInCookie) > -1) {
    variantId = variantInCookie;
  }
  if (!variantId) {
    var n = 0;
    var random = Math.random();
    for (var i = 0; i < variants.length; i++) {
      var variant = variants[i];
      var testRatio = variant.testRatio;
      n += testRatio;
      if (random < n) {
        setCookie(cookieName, variant.id);
        variantId = variant.id;
        break;
      }
    }
    if (!variantId) {
      variantId = "${contentId}";
      setCookie(cookieName, "${contentId}");
    }
  }
  if (variantId && variantId !== "${contentId}") {
    var winningTemplate = document.querySelector('template[data-template-variant-id="' + variantId + '"]');
    if (winningTemplate) {
      var parentNode = winningTemplate.parentNode;
      var newParent = parentNode.cloneNode(false);
      newParent.appendChild(winningTemplate.content.firstChild);
      parentNode.parentNode.replaceChild(newParent, parentNode);
    }
  } else if (variants.length > 0) {
    removeVariants();
  }
})()`.replace(/\s+/g, ' ');

interface VariantsProviderProps {
  initialContent: BuilderContent;
  children: (variants: BuilderContent[], renderScript?: () => JSX.Element) => JSX.Element;
}

export const VariantsProvider: React.SFC<VariantsProviderProps> = ({
  initialContent,
  children,
}) => {
  if (Builder.isBrowser && !builder.canTrack) {
    return children([initialContent]);
  }

  const hasTests = Boolean(Object.keys(initialContent?.variations || {}).length);

  if (!hasTests) return children([initialContent]);

  const variants: BuilderContent[] = Object.keys(initialContent.variations!).map(id => ({
    id,
    ...initialContent.variations![id],
    data: getData(initialContent.variations![id]!),
  }));

  const allVariants = [...variants, initialContent];
  if (Builder.isServer) {
    const variantsJson = JSON.stringify(
      Object.keys(initialContent.variations || {}).map(item => ({
        id: item,
        testRatio: initialContent.variations![item]!.testRatio,
      }))
    );
    const renderScript = () => (
      <script
        dangerouslySetInnerHTML={{
          __html: variantsScript(variantsJson, initialContent.id!),
        }}
      ></script>
    );

    // render all variants on the server side
    return <React.Fragment>{children(allVariants, renderScript)}</React.Fragment>;
  }

  const cookieName = `builder.tests.${initialContent.id}`;

  let variantId = builder.getCookie(cookieName);

  if (!variantId && Builder.isBrowser) {
    let n = 0;
    const random = Math.random();
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const testRatio = variant.testRatio;
      n += testRatio!;
      if (random < n) {
        builder.setCookie(cookieName, variant.id);
        variantId = variant.id;
        break;
      }
    }
  }

  if (!variantId) {
    // render initial content when no winning variation or on the server
    variantId = initialContent.id;
    builder.setCookie(cookieName, variantId);
  }

  return children([allVariants.find(item => item.id === variantId)!]);
};
