import React, { useState, useEffect, useRef } from 'react';
import { Builder, BuilderElement, BuilderStore, builder } from '@builder.io/react';
import { findAndRunScripts } from '../functions/find-and-run-scripts';

interface LiquidBlockProps {
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

export const LiquidBlock = (props: LiquidBlockProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const blockName = props.templatePath?.split('/')[1].replace(/\.liquid$/, '')!;

  useEffect(() => {
    const blockId = props.builderBlock?.id;
    const node = blockId && refs && refs[blockId];
    if (!node) {
      if (cache[blockName]) {
        return;
      }
      // Convert `sections/foo.liquid` -> `foo`
      if (!blockName) {
        return;
      }
      if (cache[blockName]) {
        setHtml(cache[blockName]);
        return;
      }

      // TODO
      const args = '';

      fetch(
        `${builder.host}/api/v1/shopify/data/render-liquid-snippet?snippet=${blockName}&apiKey=${props.builderState?.context.apiKey}&args=${args}`
      )
        .then(res => res.json())
        .then(json => {
          const text = json.liquidSnippet;
          cache[blockName] = text;
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
  }, [blockName]);

  return (
    <div
      ref={ref}
      builder-liquid-block={props.builderBlock?.id}
      className="builder-liquid-block"
      dangerouslySetInnerHTML={{ __html: html || cache[blockName] || '' }}
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
