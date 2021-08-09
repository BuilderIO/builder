import { Builder, builder, BuilderComponent } from '@builder.io/react';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import React, { RefObject, useCallback, useEffect } from 'react';
import { CsatWidget } from '../../../components/csat-widget';
import { renderLink } from '../../../functions/render-link';
import { defaultTitle, defaultDescription } from '../../../constants/seo-tags';
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';

builder.init('YJIGb4i01jvw0SRdL5Bt');

const verticalBreakWidth = 800;
const verticalBreakpoint = `@media (max-width: ${verticalBreakWidth}px)`;

function getAllParents(el: Element, includeRootElement = false) {
  const nodes: Element[] = [];
  let element = el;
  if (includeRootElement) {
    nodes.push(element);
  }
  while (element.parentElement) {
    nodes.unshift(element.parentElement);
    element = element.parentElement;
  }
  return nodes;
}

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

  // We do this manually (jquery-esque) so this content can be controlled in Builder
  // and support n-level deep trees with full customization but still the ability to
  // auto expand and scroll to the relevant section in the nav based on the chosen link
  const accordionListener = useCallback((event: React.MouseEvent) => {
    const target = event.target;
    if (target instanceof Element) {
      const parents = getAllParents(target, true);
      for (const parent of parents) {
        const nextSibling = parent.nextElementSibling;
        if (nextSibling?.classList.contains('collapsable')) {
          nextSibling.classList.toggle('collapsed');
          break;
        }
      }
    }
  }, []);

  const router = useRouter();

  const title = `${
    (docsContent && docsContent.data.pageTitle) || defaultTitle
  } | Builder.io`;

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: 16,
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
        {!docsContent && <meta key="robots" name="robots" content="noindex" />}
        <title>{title}</title>
        <meta key="og:title" property="og:title" content={title} />
        <meta key="twitter:title" property="twitter:title" content={title} />
        <meta
          name="description"
          content={
            (docsContent && docsContent.data.description) || defaultDescription
          }
        />
      </Head>

      <header
        css={{
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          borderBottom: '1px solid #CBCAB7',
          boxShadow:
            '0px 2px 2px rgba(0, 0, 0, 0.04), 0px 1px 11px rgba(0, 0, 0, 0.1)',
        }}
      >
        <BuilderComponent
          renderLink={renderLink}
          name="docs-header"
          content={docsHeader}
        />
      </header>

      <div
        css={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'stretch',
          overflow: 'hidden',
          margin: '0 auto',
          width: '100%',
          height: '100%',
          maxWidth: 1400,
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
          <nav
            css={{
              width: 280,
              flexShrink: 0,
              height: '100%',
              overflow: 'auto',
              [verticalBreakpoint]: {
                width: '100%',
                height: 'auto',
                overflow: 'visible',
              },
            }}
            onClick={accordionListener}
          >
            <ClientRouteWrapper contentRef={pageContent}>
              <BuilderComponent
                stopClickPropagationWhenEditing={true}
                renderLink={renderLink}
                name="docs-nav"
                content={docsNav}
              />
            </ClientRouteWrapper>
          </nav>
          <main
            className="docs-content-container"
            css={{
              padding: '30px 50px 50px 50px',
              flexGrow: 1,
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              borderRadius: 0,
              [verticalBreakpoint]: {
                overflow: 'visible',
                overflowY: 'visible',
                height: 'auto',
                padding: 20,
                margin: '10px 0',
              },
              '& .builder-text': {
                lineHeight: '1.5em',
              },
            }}
            ref={pageContent as any}
          >
            {docsContent || Builder.isEditing || Builder.isPreviewing ? (
              <>
                <BuilderComponent
                  renderLink={renderLink}
                  key={docsContent?.id}
                  name="docs-content"
                  content={docsContent}
                />
                <CsatWidget key={router.asPath} css={{ marginTop: 50 }} />
              </>
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
                    href="/c/docs/intro"
                  >
                    go to our docs homepage
                  </a>
                </p>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const results = await builder.getAll('docs-content', {
    key: 'articles:all',
    fields: 'data.url',
    limit: 200,
    options: {
      noTargeting: true,
    },
  });

  return {
    paths: results.map((item) => ({
      params: {
        doc: (item.data?.url?.replace('/c/docs/', '') || '').split('/'),
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const props = await getContent(context);
  return { revalidate: 1, props, notFound: !props.docsContent };
};

const getContent = async (context: GetStaticPropsContext) => {
  const path = `/c/docs/${(context.params?.doc as string[])?.join('/') || ''}`;
  // Don't target on url and device for better cache efficiency
  const userAttributes = { urlPath: '_', device: '_' } as any;

  const [nav, content, docsHeader] = await Promise.all([
    builder.get('docs-nav', { userAttributes }).promise(),
    builder
      .get('docs-content', {
        userAttributes: { ...userAttributes, urlPath: path },
      })
      .promise(),
    builder.get('docs-header', { userAttributes }).promise(),
  ]);

  return { docsContent: content || null, docsNav: nav, docsHeader };
};

export default Docs;

class ClientRouteWrapper extends React.Component<{
  contentRef?: RefObject<HTMLElement>;
}> {
  containerRef = React.createRef<any>() as any;

  componentDidMount() {
    setTimeout(() => {
      updateActiveLink();
    });
    this.containerRef.current.addEventListener('click', (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const anchor = event.target.closest('a');
      if (
        !event.metaKey &&
        anchor &&
        anchor.pathname.startsWith('/c/docs') &&
        anchor.target !== '_blank'
      ) {
        updateActiveLink(anchor.pathname);
        if (!event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          Router.push(anchor.pathname).then(() => {
            if (this.props.contentRef && this.props.contentRef.current) {
              this.props.contentRef.current.scrollTop = 0;
            }
            window.scrollTo(0, 0);
          });
        }
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
  const query = `a[href="${path}"],a[href="https://www.builder.io${path}"],a[href="https://builder.io${path}"]`;
  const allDocsNavLinksSelector = `[builder-model="${modelName}"] .${activeLinkClass}`;

  const el = document.querySelector(query);
  if (el) {
    el.classList.add(activeLinkClass);

    for (const parent of getAllParents(el)) {
      if (parent.classList.contains('collapsed')) {
        parent.classList.remove('collapsed');
      }
    }
    // Only scroll active links into view in horizontal layout
    if (window.innerWidth >= verticalBreakWidth) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  const allCurrent = document.querySelectorAll(allDocsNavLinksSelector);
  allCurrent.forEach((current) => {
    if (current && current !== el) {
      current.classList.remove(activeLinkClass);
    }
  });
}
