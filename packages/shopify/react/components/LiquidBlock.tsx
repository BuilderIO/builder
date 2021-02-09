import React, { useState, useEffect, useRef } from 'react';
import { Builder, BuilderElement, BuilderStore, builder } from '@builder.io/react';
import { findAndRunScripts } from '../functions/find-and-run-scripts';
import { serializeLiquidArgs } from '../functions/serialize-liquid-args';

interface LiquidBlockProps {
  options?: Record<string, number | boolean | string>;
  templatePath?: string;
  builderBlock?: BuilderElement;
  builderState?: BuilderStore;
}
const cache: { [key: string]: string } = {};

const refs =
  Builder.isBrowser &&
  Array.from(document.querySelectorAll('[builder-liquid-block]')).reduce((memo, item) => {
    memo[item.getAttribute('builder-liquid-block')!] = item;
    return memo;
  }, {} as { [key: string]: Element });

export const LiquidBlock = ({
  options,
  builderBlock,
  templatePath,
  builderState,
}: LiquidBlockProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const blockName = templatePath?.split('/')[1].replace(/\.liquid$/, '')!;

  useEffect(() => {
    const blockId = builderBlock?.id;
    const node = blockId && refs && refs[blockId];
    const args = serializeLiquidArgs(options);
    const cacheKey = blockName + args;

    if (!node || Builder.isEditing || Builder.isPreviewing) {
      if (cache[cacheKey]) {
        return;
      }

      // Convert `sections/foo.liquid` -> `foo`
      if (!blockName) {
        return;
      }

      if (cache[cacheKey]) {
        setHtml(cache[cacheKey]);
        return;
      }

      const previewThemeID =
        (Builder.isBrowser && (window as any).Shopify?.theme?.id) ||
        builderState?.state?.location?.query?.preview_theme_id;
      fetch(
        `${builder.host}/api/v1/shopify/data/render-liquid-snippet?snippet=${blockName}&apiKey=${
          builderState?.context.apiKey
        }&args=${encodeURIComponent(args)}${
          previewThemeID ? `&preview_theme_id=${previewThemeID}` : ''
        }`
      )
        .then(res => res.json())
        .then(json => {
          const text = json.liquidSnippet;
          cache[cacheKey] = text;
          setHtml(text);
          setTimeout(() => {
            if (ref.current) {
              findAndRunScripts(ref.current);
            }
          }, 10);
        });
    } else {
      if (node && ref.current) {
        ref.current.parentNode?.replaceChild(node, ref.current);
      }
    }
  }, [options, blockName]);

  return (
    <div
      ref={ref}
      builder-liquid-block={builderBlock?.id}
      className="builder-liquid-block"
      dangerouslySetInnerHTML={{
        __html: html || cache[blockName + serializeLiquidArgs(options)] || '',
      }}
    />
  );
};

Builder.registerComponent(LiquidBlock, {
  name: 'Shopify:LiquidBlock',
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'templatePath',
      type: 'string',
      advanced: true,
    },
    {
      name: 'options',
      type: 'LiquidBlockOptions',
    },
  ],
});
