import * as React from 'react'
import {
  builder,
  Builder,
  BuilderContent,
  BuilderContentVariation
} from '@builder.io/sdk'

function getData(content: BuilderContentVariation) {
  if (typeof content?.data === 'undefined') {
    return undefined
  }

  const newData: any = {
    ...content.data,
    blocks: content.data.blocks || JSON.parse(content.data.blocksString)
  }

  delete newData.blocksString
  return newData
}

const variantsScript = (variantsString: string, contentId: string) => `
(function() {
  if (typeof document.createElement("template").content === 'undefined') {
    // IE 11
    return ;
  }

  function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
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

  var variants = ${variantsString};
  var cookieName = 'builder.tests.${contentId}';
  var variantId = getCookie(cookieName);
  if (!variantId) {
    var n = 0;
    var set = false;
    var random = Math.random();
    for (var i = 0; i < variants.length; i++) {
      var variant = variants[i];
      var testRatio = variant.testRatio;
      n += testRatio;
      if (random < n) {
        setCookie(cookieName, variant.id);
        variantId = variant.id;
      }
    }
    if (!variantId) {
      variantId = "${contentId}";
      setCookie(cookieName, "${contentId}");
    }
  }
  if (variantId && variantId !== "${contentId}") {
    var winningTemplate = document.querySelector('template[data-template-variant-id="' + variantId + '"]')
    if (winningTemplate) {
      var parentNode = winningTemplate.parentNode;
      while (parentNode.firstChild) {
        parentNode.firstChild.remove();
      }
      parentNode.appendChild(winningTemplate.content.firstChild);
    }
  }
})()
`

interface VariantsProviderProps {
  initialContent: BuilderContent
  isStatic: boolean;
  children: (variants: BuilderContent[]) => JSX.Element
}

export const VariantsProvider: React.SFC<VariantsProviderProps> = ({
  initialContent,
  isStatic,
  children
}) => {
  const hasTests = Boolean(Object.keys(initialContent?.variations || {}).length)

  if (!hasTests) return children([initialContent])

  const variants: BuilderContent[] = Object.keys(
    initialContent.variations!
  ).map(id => ({
    id,
    ...initialContent.variations![id],
    data: getData(initialContent.variations![id]!)
  }))

  const allVariants = [initialContent, ...variants]
  if (Builder.isServer && isStatic) {
    const variantsJson = JSON.stringify(
      Object.keys(initialContent.variations || {}).map(item => ({
        id: item,
        testRatio: initialContent.variations![item]!.testRatio
      }))
    )

    // render all variants on the server side
    return (
      <React.Fragment>
        {children(allVariants)}
        <script
          dangerouslySetInnerHTML={{
            __html: variantsScript(variantsJson, initialContent.id!)
          }}
        ></script>
      </React.Fragment>
    )
  }

  const cookieName = `builder.tests.${initialContent.id}`

  const variantId = builder.getCookie(cookieName) || initialContent?.id

  // Q: Calculate variants and set cookie on client side?

  return children([allVariants.find(item => item.id === variantId)!])
}
