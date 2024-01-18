import { Builder } from '@builder.io/react';
import Search from '@material-ui/icons/Search';
import Router from 'next/router';
import useEventListener from 'use-typed-event-listener';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import { useRef, useEffect, useState } from 'react';
import escapeRegExp from 'lodash/escapeRegExp';
import uniqBy from 'lodash/uniqBy';
import { GoogleSearchResponse } from '../interfaces/google-json-search';
import { renderLink as RenderLink } from '../functions/render-link';
import { DiscourseResponse } from '../interfaces/discourse-search';
import useDebounce from 'react-use/lib/useDebounce';
import { defaultSearchBarPlaceholder } from './docs-search.config';

function escapeHtml(unsafeText: string) {
  const div = document.createElement('div');
  div.innerText = unsafeText;
  return div.innerHTML;
}

const proxyUrl = (url: string) =>
  `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(url)}`;

type DocsSearchProps = { placeholder?: string };

export function DocsSearch(props: DocsSearchProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient ? <DocsSearchBrowser {...props} /> : null;
}

function DocsSearchBrowser(props: DocsSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(
    null as SearchResult[] | null,
  );
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  async function getGoogleResults(
    text = searchText,
  ): Promise<GoogleSearchResponse> {
    return fetch(
      `https://www.googleapis.com/customsearch/v1/siterestrict?key=AIzaSyApBC9gblaCzWrtEBgHnZkd_B37OF49BfM&cx=012652105943418481980:b8ow8geasbo&q=${encodeURIComponent(
        text,
      )}`,
    ).then((res) => res.json());
  }
  async function getForumResults(
    text = searchText,
  ): Promise<DiscourseResponse> {
    return fetch(
      proxyUrl(
        `https://forum.builder.io/search/query.json?term=${encodeURIComponent(
          text,
        )}`,
      ),
    ).then((res) => res.json());
  }
  async function getBuilderResults(
    text = searchText,
  ): Promise<BuilderContentResponse> {
    const fields = [
      'name',
      'data.pageTitle',
      'data.description',
      'data.tags',
      'data.keywords',
    ];
    const url = `https://cdn.builder.io/api/v3/content/docs-content?apiKey=YJIGb4i01jvw0SRdL5Bt&query.$or=${JSON.stringify(
      fields.map((field) => ({
        [field]: { $regex: text, $options: 'i' },
      })),
    )}&fields=name,data.pageTitle,data.description,data.tags,data.keywords,data.url`;
    return fetch(url).then((res) => res.json());
  }
  async function search(): Promise<void> {
    if (!searchText) {
      setSearchResult(null);
      return;
    }
    setLoading(true);
    const [builderResponse, googleResponse, forumResponse] = await Promise.all([
      getBuilderResults(searchText),
      getGoogleResults(searchText),
      getForumResults(searchText).catch((err) => {
        console.error('Error getting Discourse posts', err);
        return null;
      }),
    ]).catch((err) => {
      console.error('Search error:', err);
      setLoading(false);
      return [];
    });
    if (!googleResponse || !builderResponse) {
      return;
    }

    const results: SearchResult[] = uniqBy(
      builderResponse?.results || [],
      (item) => item.data.url,
    ).map(
      (item) =>
        ({
          title: item.data.pageTitle,
          url: `https://www.builder.io${item.data.url}`,
          // Bold exact text matches
          htmlTitle: escapeHtml(item.data.pageTitle || '').replace(
            new RegExp(escapeRegExp(searchText), 'gi'),
            (match) => `<b>${match}</b>`,
          ),
          htmlDescription: escapeHtml(item.data.description || '').replace(
            new RegExp(escapeRegExp(searchText), 'gi'),
            (match) => `<b>${match}</b>`,
          ),
        } as SearchResult),
    );

    const googleResults = googleResponse!.items;
    if (googleResults) {
      for (const item of googleResults) {
        const { pathname, hostname } = new URL(item.link);
        let skip = false;
        if (hostname === 'www.builder.io' || hostname === 'forum.builder.io') {
          // For each of our results, if Google has a result too, augment it
          // with the info from Google as Google pulls in additional info like
          // the exact matching text snippet on the page, formatted titles
          // (with bolding for matches), etc
          for (const result of results) {
            let parsed: URL | null = null;
            try {
              parsed = new URL(result.url);
            } catch (err) {
              console.error('Could not parse url', result.url, err);
            }
            if (parsed?.pathname === pathname) {
              result.htmlDescription = item.htmlSnippet;
              result.htmlTitle = item.htmlTitle;
              result.displayLink = item.displayLink;
              skip = true;
            }
          }
        }
        if (!skip) {
          results.push({
            url: item.link,
            title: item.title,
            htmlTitle: item.htmlTitle,
            htmlDescription: item.htmlSnippet,
            displayLink: item.displayLink,
          });
        }
      }
    }

    // TODO: filter to ensure google didn't also pick up this forum result
    const forumResultstoUse =
      forumResponse?.topics?.map((item) => {
        const blurb =
          item.excerpt ||
          forumResponse.posts?.find((post) => post.topic_id == item.id)?.blurb;

        return {
          title: item.title,
          url: `https://forum.builder.io/t/${item.slug}/${item.id}`,
          htmlTitle: escapeHtml(item.title || '').replace(
            new RegExp(escapeRegExp(searchText), 'gi'),
            (match) => `<b>${match}</b>`,
          ),
          htmlDescription: escapeHtml(blurb || '').replace(
            new RegExp(escapeRegExp(searchText), 'gi'),
            (match) => `<b>${match}</b>`,
          ),
        };
      }) || [];
    results.push(...forumResultstoUse);

    setSearchResult(
      results.filter((item) => {
        try {
          const parsedUrl = new URL(item.url);
          // Remove marketing pages (homepage and /m/ pages) from docs search results
          if (['builder.io', 'www.builder.io'].includes(parsedUrl.hostname)) {
            if (
              parsedUrl.pathname === '/' ||
              parsedUrl.pathname.startsWith('/m/')
            ) {
              return false;
            }
          }
        } catch (err) {
          console.error('Error parsing URL', item.url, err);
          return false;
        }
        return true;
      }),
    );
    setLoading(false);
  }

  const inputRef = useRef<HTMLInputElement | null>(null);

  const { width, left, bottom } =
    inputRef.current?.getBoundingClientRect() || {};

  if (Builder.isBrowser) {
    useEventListener(document.body, 'keyup', (event) => {
      // Listen for `/` key down to focus search
      if (
        event.key === '/' &&
        document.activeElement === document.body && // An input is not focused
        inputRef.current
      ) {
        inputRef.current.focus();
      }
    });
  }

  useDebounce(
    () => {
      search();
    },
    500,
    [searchText],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        search();
      }}
    >
      <div
        css={{
          display: 'flex',
          width: '100%',
          position: 'relative',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  css={{
                    color: '#999',
                    marginRight: -2,
                    marginTop: -2,
                    fontSize: 20,
                  }}
                />
              </InputAdornment>
            ),
          }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          inputRef={inputRef}
          type="search"
          placeholder={props.placeholder ?? defaultSearchBarPlaceholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {loading && (
          <CircularProgress
            css={{
              position: 'absolute',
              right: 30,
            }}
            size={20}
            disableShrink
          />
        )}
      </div>

      {Boolean(searchResult?.length) && searchFocused && (
        <Paper
          elevation={24}
          css={{
            position: 'fixed',
            left: (left || 0) + (width || 0) / 2 || '50%',
            transform: 'translateX(-50%)',
            width: 700,
            maxWidth: '90vw',
            zIndex: 100,
            top: bottom || 200,
            maxHeight: bottom ? window.innerHeight - bottom - 10 : undefined,
            overflow: 'auto',
          }}
        >
          <List>
            {searchResult!.map((item, index) => (
              <ListItem
                button
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (
                    item.url.includes('builder.io/c/docs') ||
                    item.url.startsWith('/c/docs')
                  ) {
                    Router.push(
                      item.url.startsWith('/c/docs')
                        ? item.url
                        : item.url.split('builder.io')[1],
                    ).then(() => {
                      const docsContentContainer = document.querySelector(
                        '.docs-content-container',
                      );
                      if (docsContentContainer) {
                        docsContentContainer.scrollTop = 0;
                      }
                    });
                    setTimeout(() => {
                      inputRef.current?.blur();
                    }, 200);
                  } else {
                    window.open(item.url, '_blank');
                  }
                }}
              >
                <RenderLink
                  href={item.url}
                  {...(!item.url.includes('/c/docs')
                    ? { target: '_blank' }
                    : null)}
                >
                  <div css={{ fontSize: 10, opacity: 0.4 }}>
                    {item.url.includes('forum.builder.io')
                      ? 'Builder Forum'
                      : item.url.includes('www.builder.io') ||
                        item.displayLink === 'www.builder.io'
                      ? 'Builder Docs'
                      : item.displayLink || 'Builder Docs'}
                  </div>
                  <ListItemText
                    primary={
                      item.htmlTitle ? (
                        <span
                          dangerouslySetInnerHTML={{ __html: item.htmlTitle }}
                        />
                      ) : (
                        item.title
                      )
                    }
                    secondary={
                      item.htmlDescription ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item.htmlDescription,
                          }}
                        />
                      ) : (
                        item.description || `Learn about ${item.title}`
                      )
                    }
                  />
                </RenderLink>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </form>
  );
}

interface SearchResult {
  url: string;
  title: string;
  description?: string;
  htmlTitle?: string;
  htmlDescription?: string;
  displayLink?: string;
}

export interface BuilderContentResponse {
  results: ResultsEntity[];
}
export interface ResultsEntity {
  name: string;
  data: Data;
}
export interface Data {
  pageTitle?: string | null;
  keywords?: string | null;
  tags?: string | null;
  description?: string | null;
  url: string;
}
