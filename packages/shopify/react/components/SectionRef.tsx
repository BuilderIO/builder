import React, { useState, useEffect } from 'react';
import { Builder } from '@builder.io/react';

interface SectionRefProps {
  class?: string;
  section?: string;
}
const cache: { [key: string]: string } = {};

export const SectionRef = (props: SectionRefProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const sectionName = props.section?.split('/')[1].split('.')[0]!;

  useEffect(() => {
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
    fetch(`${location.search ? '&' : '?'}section_id=${sectionName}`)
      .then(res => res.text())
      .then(text => {
        cache[sectionName] = text;
        setHtml(text);
      });
  }, [sectionName]);

  return (
    <div
      className={`shopify-section ${props.class}`}
      dangerouslySetInnerHTML={{ __html: html || cache[sectionName] || '' }}
    />
  );
};

Builder.registerComponent(SectionRef, {
  name: 'Shopify:SectionRef',
  hideFromInsertMenu: true,
});
