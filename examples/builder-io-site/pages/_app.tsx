/** @jsx jsx */
import CssBaseline from '@material-ui/core/CssBaseline';
import { builder } from '@builder.io/react';
import '@builder.io/widgets';
import { jsx } from '@emotion/core';
import Head from 'next/head';
import '../global.css';
import green from '@material-ui/core/colors/green';

// Import our components so they get registered
import '../components/animated-logo';
import '../components/code-block';
import '../components/material-table';
import '../components/tooltip';
import '../components/graphiql-explorer';
import '../scripts/init-referrer-cookie';
import '../components/material-tabs';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

builder.init('YJIGb4i01jvw0SRdL5Bt');

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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: { main: 'rgba(28, 151, 204, 1)' },
    secondary: green,
  },
});

function scrollToElementInLocationHash() {
  if (location.hash) {
    const hash = location.hash.slice(1);
    if (hash.startsWith('text:')) {
      const [_, text, indexString] = hash.split('text:');
      if (text) {
        const index = parseFloat(indexString) || 0;
        console.time('Match hash');
        const kebabCase = (str: string) =>
          str
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z\-]/g, '');

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

function MyApp({ Component, pageProps, headerContent }: any /* TODO: types */) {
  if (typeof window !== 'undefined') {
    addEventListener('builder:component:load', () => {
      scrollToElementInLocationHash();
    });
  }

  return (
    <>
      <Head>
        <title>Builder: Drag and Drop Page Building for Any Site</title>
        <meta
          property="og:image"
          content="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff0b8ad1720b14706befb9c822d6d70e4"
        />
        <meta property="og:image:width" content="1346" />
        <meta property="og:image:height" content="721" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://builder.io" />
        <meta name="description" content="Build and optimize digital experiences. Visually." />
      </Head>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </MuiThemeProvider>
    </>
  );
}
export default MyApp;
