import '../styles/global.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import { builder, Builder } from '@builder.io/react';
import Head from 'next/head';
import green from '@material-ui/core/colors/green';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import SingletonRouter, { Router } from 'next/router';
// Import our components so they get registered
import '../scripts/init-referrer-cookie';
import React, { useCallback } from 'react';
import { AppPropsType } from 'next/dist/next-server/lib/utils';

import '../components/widgets';
import '../components/logo';
import { defaultDescription, defaultTitle } from '@/constants/seo-tags';

Builder.isStatic = true;
// Heavy handed disable fonts for perf
builder.allowCustomFonts = false;

const importTrack = () => import('../functions/track');

builder.init('YJIGb4i01jvw0SRdL5Bt');

Router.events.on('routeChangeComplete', () => {
  importTrack().then(({ track }) => track('pageView'));
});

if (Builder.isBrowser) {
  importTrack().then(({ track }) =>
    track('pageView', {
      initial: true,
    }),
  );
}

const theme = createMuiTheme({
  overrides: {
    MuiBackdrop: {
      invisible: {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
      },
      root: {
        backdropFilter: 'blur(2px)',
      },
    },
  },
  typography: {
    fontFamily: '"Avenir", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: { main: 'rgba(28, 151, 204, 1)' },
    secondary: green,
  },
});

function scrollToElementInLocationHash() {
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('text:')) {
      const [, text, indexString] = hash.split('text:');
      if (text) {
        const index = parseFloat(indexString) || 0;
        console.time('Match hash');
        const kebabCase = (str: string) =>
          str
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z-]/g, '');

        let matches = 0;
        for (const el of Array.from(document.querySelectorAll('*'))) {
          // TODO: very convenient, but has perf impact
          if (el instanceof HTMLElement) {
            if (++matches < index) {
              continue;
            }
            const kebabText = kebabCase(el.innerText);
            if (kebabText === text) {
              el.scrollIntoView({ behavior: 'smooth' });
              break;
            }
          }
        }
        console.timeEnd('Match hash');
      }
    }
  }
}

function MyApp({ Component, pageProps, router }: AppPropsType) {
  if (typeof window !== 'undefined') {
    window.addEventListener('builder:component:load', () => {
      scrollToElementInLocationHash();
    });
  }

  // Catchall to make sure we route links client side
  const handleClick = useCallback((event: React.MouseEvent<Element>) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const anchor = event.target.closest('a');
    if (
      !event.metaKey &&
      !event.defaultPrevented &&
      anchor?.host.includes('builder.io') &&
      anchor &&
      (anchor.pathname === '/' ||
        anchor.pathname.startsWith('/m/') ||
        anchor.pathname.startsWith('/c/')) &&
      !anchor.pathname.startsWith('/c/docs') &&
      anchor.target !== '_blank'
    ) {
      event.preventDefault();
      const rest = anchor.pathname.split('/').slice(2);
      SingletonRouter.push(anchor.pathname).then(() => {
        window.scrollTo(0, 0);
      });
    }
  }, []);

  const urlPath = router.asPath.split('?')[0];

  return (
    <>
      <Head>
        <title>
          Builder.io: Visual no-code content management for e-comerce
        </title>
        <meta key="robots" name="robots" content="index, follow" />
        {/* We override og info for blog */}
        {!router.asPath.includes('/blog/') && (
          <>
            <meta
              key="og:image"
              property="og:image"
              content="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F1bfe678f91004935b3897c7f3881014b"
            />
            <meta
              key="og:image:width"
              property="og:image:width"
              content="1200"
            />
            <meta
              key="og:image:height"
              property="og:image:height"
              content="627"
            />
            <meta name="description" content={defaultDescription} />
            <meta key="og:type" property="og:type" content="website" />

            <meta
              key="twitter:card"
              property="twitter:card"
              content="summary_large_image"
            />
            <meta
              key="twitter:title"
              property="twitter:title"
              content={defaultTitle}
            />
            <meta
              key="twitter:description"
              property="twitter:description"
              content={defaultDescription}
            />
            <meta
              key="twitter:image"
              property="twitter:image"
              content="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F1bfe678f91004935b3897c7f3881014b"
            />
          </>
        )}

        <link rel="canonical" href={`https://www.builder.io${urlPath}`} />
        <meta
          key="og:url"
          property="og:url"
          content={`https://www.builder.io${urlPath}`}
        />
      </Head>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <div onClick={handleClick}>
          <Component {...pageProps} />
        </div>
      </MuiThemeProvider>
    </>
  );
}
export default MyApp;
