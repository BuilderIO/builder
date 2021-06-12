import React, { Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Builder, BuilderComponent } from '@builder.io/react';
import cheerio from 'cheerio';
import Head from 'next/head';

function toAmp(htmlStr) {
  return (
    htmlStr
      .replace(/\sbuilder-[\w-]+="[^"]+"/g, ' ')
      // TODO: remove once react sdk stable 1.1.45 is released
      .replace(/loading="lazy"/g, '')
      .replace(/\sclassName="(?<values>.*?)"/g, 'class="$<values>"')
  );
}

/**
 */
const extractHeadStyles = (body) => {
  let globalStyles = '';
  let html = body;
  if (body) {
    const $ = cheerio.load(body);
    const styles = $('style');
    globalStyles = styles
      .toArray()
      .map((el) => {
        const style = $(el).html();
        html = html.replace($.html(el), '');
        return style;
      })
      .join(' ');
  }
  return { globalStyles, html };
};

export default function BuilderPageWrapper(props) {
  if (Builder.isEditing || Builder.isPreviewing || !props.content) {
    return <BuilderComponent {...props} />;
  }

  const ampHtml = renderToStaticMarkup(<BuilderComponent {...props} />);
  const { globalStyles, html } = extractHeadStyles(ampHtml);
  // workaround a bug in nextjs causing invalid amp error https://stackoverflow.com/a/63732868/3109205
  const fixCSS = `}${globalStyles}{`;
  return (
    <Fragment>
      <Head>
        <style jsx>
          {`
            ${fixCSS}
          `}
        </style>
      </Head>
      <div dangerouslySetInnerHTML={{ __html: toAmp(html) }} />
    </Fragment>
  );
}
