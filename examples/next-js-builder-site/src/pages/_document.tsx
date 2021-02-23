/* eslint-disable react/no-danger */
import Document, { Html, Head, Main, NextScript } from 'next/document';

import React from 'react';
import { ServerStyleSheets } from '@material-ui/styles';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) => (props: any) =>
          sheets.collect(<App {...props} />),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [
        ...React.Children.toArray(initialProps.styles),
        sheets.getStyleElement(),
      ],
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="theme-color" content="#f8f8f8" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

          <link
            rel="icon"
            type="image/png"
            href="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2d86a5bb30f44d2db3564aa2962bb093"
          />
          <link
            rel="chrome-webstore-item"
            href="https://chrome.google.com/webstore/detail/cfldfgibklhmjhnkfighkbafbkbfcmij"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `              
                /* Redirect to www.builder.io */
                if (location.host === 'app.builder.io') {
                  location.href = location.href.replace('//app.builder.io', '//www.builder.io');
                } else if (location.host === 'builder.io') {
                  location.href = location.href.replace('//builder.io', '//www.builder.io');
                }
                
                // Redirect logged in users to the login page of the app
                if (location.pathname === '/' && location.host === 'www.builder.io' && document.cookie.includes('builder.userLoggedIn=true') && !location.href.includes('__builder_editing__')) {
                  location.href = 'https://builder.io/login';
                }
                `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* Intercom */}
          <script
            async
            defer
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                if (navigator.userAgent.match(/chrome-lighthouse|Google Page Speed/i)) {
                  return;
                }
                window.intercomSettings = {
                  app_id: 'xazs9xxv'
                };
                // TODO: load this from the app and have better app logic around when to load tracking
                if (
                  location.hostname === 'localhost' ||
                  location.hostname === 'local.builder.io' ||
                  window.top !== window.self
                ) {
                  return;
                }
                var w = window;
                var ic = w.Intercom;
                if (typeof ic === 'function') {
                  ic('reattach_activator');
                  ic('update', intercomSettings);
                } else {
                  var d = document;
                  var i = function() {
                    i.c(arguments);
                  };
                  i.q = [];
                  i.c = function(args) {
                    i.q.push(args);
                  };
                  w.Intercom = i;

                  function l() {
                    var s = d.createElement('script');
                    s.type = 'text/javascript';
                    s.async = true;
                    s.src = 'https://widget.intercom.io/widget/xazs9xxv';
                    var x = d.getElementsByTagName('script')[0];
                    x.parentNode.insertBefore(s, x);
                  }
                  if (w.attachEvent) {
                    w.attachEvent('onload', l);
                  } else {
                    w.addEventListener('load', l, false);
                  }
                }
              })();
            `,
            }}
          />

          <script
            async
            defer
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments);
            }
            gtag('js', new Date());

            gtag('config', 'UA-108006325-1');
          `,
            }}
          />
          <script
            async
            defer
            src="https://www.googletagmanager.com/gtag/js?id=UA-108006325-1"
          ></script>

          {/* Start ZoomInfo tracking */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function () {
                var zi = document.createElement('script');
                zi.type = 'text/javascript';
                zi.async = true;
                zi.src = 'https://ws.zoominfo.com/pixel/YkQV5texcwM26aYtS31R';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(zi, s);
              })();
              `,
            }}
          />
          <noscript>
            <img
              src="https://ws.zoominfo.com/pixel/YkQV5texcwM26aYtS31R"
              width="1"
              height="1"
              style={{ display: 'none' }}
            />
          </noscript>
          {/* End ZoomInfo tracking */}
        </body>
      </Html>
    );
  }
}
