import React, { useState, useEffect, useRef } from 'react';
import { Builder, BuilderElement } from '@builder.io/react';
import { findAndRunScripts } from '../functions/find-and-run-scripts';

interface SectionRefProps {
  class?: string;
  section?: string;
  builderBlock?: BuilderElement;
}
const cache: { [key: string]: string } = {};

const refs =
  Builder.isBrowser &&
  Array.from(document.querySelectorAll('[builder-shopify-section]')).reduce((memo, item) => {
    memo[item.getAttribute('builder-shopify-section')!] = item;
    return memo;
  }, {} as { [key: string]: Element });

export const SectionRef = (props: SectionRefProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const sectionName = props.section?.split('/')[1]?.replace(/\.liquid$/, '')!;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const blockId = props.builderBlock?.id;
    const node = blockId && refs && refs[blockId];
    if (!node) {
      if (cache[sectionName]) {
        return;
      }
      // Convert `sections/foo.liquid` -> `foo`
      if (!sectionName) {
        return;
      }
      if (cache[sectionName]) {
        setHtml(cache[sectionName]);
        return;
      }
      // This may look strange, but it is how Shopify's section rendering API
      // works https://shopify.dev/docs/themes/sections/section-rendering-api
      // TODO: also send ?preview_theme_id and save that as a cookie or wrap this API
      // specifically with /shopify/v1/data etc
      fetch(
        `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(
          `https://${
            location.host + location.pathname.replace('/apps/builder/preview', '')
          }?section_id=${sectionName}&${location.search.replace('?', '')}`
        )}`
      )
        .then(res => res.text())
        .then(text => {
          cache[sectionName] = text;
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
  }, [sectionName]);

  return !sectionName ? (
    <div style={{ padding: 50, textAlign: 'center' }}>
      Please choose a valid name for your section
    </div>
  ) : (
    <div
      ref={ref}
      builder-shopify-section={props.builderBlock?.id}
      className="builder-shopify-section"
      dangerouslySetInnerHTML={{ __html: html || cache[sectionName] || '' }}
    />
  );
};

Builder.registerComponent(SectionRef, {
  name: 'Shopify:SectionRef',
  friendlyName: 'Shopify Section',
  inputs: [
    {
      name: 'section',
      helperText: 'Full path to the section, e.g. sections/product.liquid',
      type: 'string',
    },
  ],
});
