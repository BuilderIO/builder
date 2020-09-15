import { parse as parseUrl } from 'url';

import React from 'react';
import Head from 'next/head';
import { useAmp } from 'next/amp';

import { builder } from '@builder.io/react';

// This is a thin wrapper that does some content post-processing
// when server-side rendering and AMP content is requested.
// Its API is the same as Builder.io's `BuilderPage` component.
import BuilderPageWrapper from '../components/BuilderPageWrapper';

// This instructs Next.js to check for the `?amp=1` query string
export const config = { amp: 'hybrid' };

// Set this in your environment or in an `.env` file
builder.init(process.env.REACT_APP_BUILDER_API_KEY);

export default function Page({ builderPage }) {
  const isAmp = useAmp();
  console.log('isAmp', isAmp);

  // Render content from Builder.io if there's any.
  if (builderPage) {
    return (
      <BuilderPageWrapper
        content={builderPage}
        model={isAmp ? 'amp-page' : 'page'}
        ampMode={isAmp}
      />
    );
  }

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <h2>{isAmp ? 'Running' : 'NOT running'} in AMP mode</h2>

        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className="grid">
          <a href="https://nextjs.org/docs" className="card">
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className="card">
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/zeit/next.js/tree/master/examples"
            className="card">
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className="card">
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer">
          Powered by <img src="/vercel.svg" alt="Vercel Logo" />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  // This simply checks if we should fetch/render content in AMP mode.
  // The actual check may vary for different frameworks or URL schemes;
  // this is how Next.js does it:
  const url = parseUrl(req.url, true);
  const ampMode = !!JSON.parse(url.query['amp'] || '0');

  // Strictly speaking, we don't really need to create `amp-page` content for
  // this to work, `page` content models will work just fine; however using
  // `amp-page` models for AMP content gives you real-time validation and more
  // within the Builder.io editor.
  const modelName = ampMode ? 'amp-page' : 'page';

  const page = await builder
    .get(modelName, {
      req,
      res,
      format: ampMode ? 'amp' : 'html',
    })
    .promise();

  if (page) {
    if (page.variationId === undefined) {
      delete page.variationId;
    }
    if (page.testVariationId === undefined) {
      delete page.testVariationId;
    }
    if (page.testVariationName === undefined) {
      delete page.testVariationName;
    }
  }

  return { props: { builderPage: page }};
};
