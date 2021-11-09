import React, { useState, useEffect, useRef } from 'react';
import { Builder, BuilderElement, BuilderStore, builder } from '@builder.io/react';
import { findAndRunScripts } from '../functions/find-and-run-scripts';

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
  const [loading, setLoading] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const blockName = templatePath?.split('/')[1].replace(/\.liquid$/, '')!;
  const renderArgs = JSON.stringify(options);

  useEffect(() => {
    const blockId = builderBlock?.id;
    const node = blockId && refs && refs[blockId];

    const cacheKey = blockName + renderArgs;

    if (!node || Builder.isEditing || Builder.isPreviewing) {
      if (cache[cacheKey]) {
        setHtml(cache[cacheKey]);
        return;
      }

      if (!blockName) {
        return;
      }

      if (cache[cacheKey]) {
        setHtml(cache[cacheKey]);
        return;
      }

      if (Builder.isEditing) {
        setLoading(loading => loading + 1);
      }

      const previewThemeID =
        (Builder.isBrowser && (window as any).Shopify?.theme?.id) ||
        builderState?.state?.location?.query?.preview_theme_id;

      fetch(
        `${builder.host}/api/v1/shopify/data/render-liquid-snippet?snippet=${blockName}&apiKey=${
          builderState?.context.apiKey
        }&args=${encodeURIComponent(renderArgs)}${
          previewThemeID ? `&preview_theme_id=${previewThemeID}` : ''
        }${Builder.isEditing ? `&cachebust=true` : ''}`
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
        })
        .finally(() => {
          if (Builder.isEditing) {
            setLoading(loading => Math.max(loading - 1, 0));
          }
        });
    } else {
      if (node && ref.current) {
        ref.current.parentNode?.replaceChild(node, ref.current);
      }
    }
  }, [options, blockName]);

  return (
    <>
      {Boolean(loading) && (
        <>
          <div
            style={{
              pointerEvents: 'none',
              zIndex: 10,
              height: 50,
              width: 50,
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              position: 'absolute',
              left: 'calc(50% - 25px)',
              top: '15%',
              background: 'linear-gradient(45deg, #F4F3E9 0%, #FFFFFF 100%)',
              border: '1px solid #F4F3E9',
              boxShadow:
                '-1px 1px 1px rgba(0, 0, 0, 0.09), -4px 4px 10px rgba(186, 186, 186, 0.25)',
              borderRadius: 100,
            }}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F3d4768d27ae441ebaaba833eda935f21"
              style={{
                width: 25,
                height: 25,
                objectFit: 'contain',
                animation: 'spin 1.6s cubic-bezier(.85,.01,.29,1) infinite',
              }}
            />
          </div>
          <style>
            {`@keyframes spin {
              from {transform:rotate(0deg);}
              to {transform:rotate(360deg);}
            }`}
          </style>
        </>
      )}
      <div
        ref={ref}
        builder-liquid-block={builderBlock?.id}
        className="builder-liquid-block"
        dangerouslySetInnerHTML={{
          __html: html || cache[blockName + renderArgs] || '',
        }}
      />
    </>
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
