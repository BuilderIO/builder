/**@jsx jsx */
import { jsx } from '@emotion/core';
import React, { RefObject, useEffect } from 'react';
import { builder, BuilderComponent } from '@builder.io/react';
import Router from 'next/router';
import Head from 'next/head';

import '@builder.io/widgets';

builder.init('YJIGb4i01jvw0SRdL5Bt');

const verticalBreakWidth = 800;
const verticalBreakpoint = `@media (max-width: ${verticalBreakWidth}px)`;

const defaultDescription =
  'Builder is the first and only headless CMS with full visual drag and drop editing';
const defaultTitle = 'Builder: Drag and Drop Page Building for Any Site';
function Docs({ docsContent, docsNav, docsHeader }: any /* TODO: types */) {
  const pageContent = React.createRef<HTMLElement>();

  // Handle forward/back buttons in the browser
  useEffect(() => {
    const updateActiveLinkWithNoArgs = () => updateActiveLink();
    Router.events.on('routeChangeComplete', updateActiveLinkWithNoArgs);
    return () => {
      Router.events.off('routeChangeComplete', updateActiveLinkWithNoArgs);
    };
  }, []);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: 16,
        backgroundColor: '#f3f3f3',
        padding: '0 20px',
        code: {
          fontSize: 14,
          lineHeight: '0.9em',
        },
        [verticalBreakpoint]: {
          height: 'auto',
          padding: 0,
        },
      }}
    >
      <Head>
        <title>{(docsContent && docsContent.data.pageTitle) || defaultTitle}</title>
        <meta
          name="description"
          content={(docsContent && docsContent.data.description) || defaultDescription}
        />
      </Head>

      <BuilderComponent model="docs-header" content={docsHeader} />

      <div
        css={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'stretch',
          overflow: 'hidden',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopRightRadius: 6,
          borderTopLeftRadius: 6,
          margin: '0 auto',
          width: '100%',
          height: '100%',
          maxWidth: 1400,
          background: 'white',
          boxShadow:
            '0px 3px 3px -2px rgba(0,0,0,0.1), 0px 3px 4px 0px rgba(0,0,0,0.07), 0px 1px 8px 0px rgba(0,0,0,0.06)',
        }}
      >
        <div
          css={{
            display: 'flex',
            flexGrow: 1,
            width: '100%',
            alignSelf: 'stretch',
            [verticalBreakpoint]: {
              flexDirection: 'column-reverse',
            },
          }}
        >
          <div
            css={{
              width: 280,
              flexShrink: 0,
              height: '100%',
              overflow: 'auto',
              backgroundColor: '#f8f8f8',
              borderRight: '1px solid #ddd',
              [verticalBreakpoint]: {
                width: '100%',
                height: 'auto',
                overflow: 'visible',
              },
            }}
          >
            <ClientRouteWrapper contentRef={pageContent}>
              <BuilderComponent model="docs-nav" content={docsNav} />
            </ClientRouteWrapper>
          </div>
          <div
            css={{
              padding: '30px 50px 50px 50px',
              flexGrow: 1,
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: 'white',
              borderRadius: 0,
              [verticalBreakpoint]: {
                overflow: 'visible',
                overflowY: 'visible',
                height: 'auto',
                padding: 20,
                margin: '10px 0',
                borderRadius: 4,
              },
            }}
            ref={pageContent as any}
          >
            {docsContent ? (
              <BuilderComponent key={docsContent.id} name="docs-content" content={docsContent} />
            ) : (
              <>
                <h3 css={{ marginTop: 20 }}>Doc not found!</h3>
                <p
                  css={{
                    marginTop: 20,
                  }}
                >
                  Try choosing another doc from the nav bar or{' '}
                  <a
                    css={{
                      color: 'steelblue',
                    }}
                    href="/c/docs/intro?v=2"
                  >
                    go to our docs homepage
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Docs.getInitialProps = async ({ req, res, asPath, ...props }: any /* TODO: types */) => {
  return await getContent(req, res, asPath);
};

const getContent = async (req: any, res: any, asPath: string) => {
  const userAttributes = { urlPath: asPath.split('?')[0] }

  const [nav, content, docsHeader] = await Promise.all([
    builder.get('docs-nav', { req, res, userAttributes }).promise(),
    builder.get('docs-content', { req, res, userAttributes }).promise(),
    builder.get('docs-header', { req, res, userAttributes }).promise(),
  ]);

  if (!content) {
    res.status = 404;
  }

  return { docsContent: content, docsNav: nav, docsHeader };
};

export default Docs;

class ClientRouteWrapper extends React.Component<{ contentRef?: RefObject<HTMLElement> }> {
  containerRef = React.createRef<any>() as any;

  componentDidMount() {
    setTimeout(() => {
      updateActiveLink();
    });
    this.containerRef.current.addEventListener('click', (event: any) => {
      const anchor = event.target.closest('a');
      if (
        !event.metaKey &&
        anchor &&
        anchor.pathname.startsWith('/c/docs') &&
        anchor.target !== '_blank'
      ) {
        event.preventDefault();
        event.stopPropagation();
        const rest = anchor.pathname.split('/').slice(0, 2);
        updateActiveLink(anchor.pathname);
        Router.push(
          {
            pathname: '/docs',
            query: {
              rest,
            },
          },
          anchor.pathname
        ).then(() => {
          if (this.props.contentRef && this.props.contentRef.current) {
            this.props.contentRef.current.scrollTop = 0;
          }
          window.scrollTo(0, 0);
        });
      }
    });
  }
  render() {
    return <div ref={this.containerRef}>{this.props.children}</div>;
  }
}

const activeLinkClass = 'active-link';
const modelName = 'docs-nav';

function updateActiveLink(path = location.pathname) {
  const query = `a[href="${path}"]`;
  const allDocsNavLinksSelector = `[builder-model="${modelName}"] .${activeLinkClass}`;

  const el = document.querySelector(query);
  if (el) {
    el.classList.add(activeLinkClass);
    // Only scroll active links into view in horizontal layout
    if (window.innerWidth >= verticalBreakWidth) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  const allCurrent = document.querySelectorAll(allDocsNavLinksSelector);
  allCurrent.forEach(current => {
    if (current && current !== el) {
      current.classList.remove(activeLinkClass);
    }
  });
}
