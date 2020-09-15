import React, { Fragment, useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BuilderPage } from '@builder.io/react';

function toAmp(htmlStr) {
  return htmlStr
    .replace(/\sbuilder-[\w-]+="[^"]+"/g, ' ')
    .replace(/\sclassName="(?<values>.*?)"/g, 'class="$<values>"');
}

function extractHtmlCss(htmlStr) {
  const cssSet = new Set();
  const newHtml = htmlStr.replace(
    /<style.*?>(?<css>[\s\S]*?)<\/style>/g,
    (_match, css) => {
      cssSet.add(css.replace(/&gt;/g, '>'));
      return '';
    }
  );

  return {
    css: [...cssSet.values()].join(' '),
    html: newHtml,
  };
}

function useSsr() {
  const [isSsr, setSsr] = useState(true);

  useEffect(() => {
    setSsr(false);
  }, []);

  return isSsr;
}

export default function BuilderPageWrapper(props) {
  const isSsr = useSsr();

  if (!isSsr || !props.ampMode) {
    return <BuilderPage {...props} />;
  }

  const { css, html } = extractHtmlCss(
    renderToStaticMarkup(<BuilderPage {...props} />)
  );

  return (
    <Fragment>
      <style jsx global>
        {css}
      </style>
      <div dangerouslySetInnerHTML={{ __html: toAmp(html) }} />
    </Fragment>
  );
}
