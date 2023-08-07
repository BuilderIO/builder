import { CONTENT as columns } from './columns.js';
import { CONTENT as elementEvents } from './element-events.js';
import { CONTENT as homepage } from './homepage.js';
import { CONTENT as cssNesting } from './css-nesting.js';
import { CONTENT as symbols, CONTENT_WITHOUT_SYMBOLS } from './symbols.js';
import { CONTENT as contentBindings } from './content-bindings.js';
import { CONTENT as linkUrl } from './link-url.js';
import { CONTENT as symbolBindings } from './symbol-bindings.js';
import { CONTENT as symbolWithInputBinding } from './symbol-with-input-binding.js';
import { CONTENT as symbolWithLocale } from './symbol-with-locale.js';
import { CONTENT as image } from './image.js';
import { CONTENT as dataBindings } from './data-bindings.js';
import { CONTENT as dataBindingStyles } from './data-binding-styles.js';
import { CONTENT as abTest } from './ab-test.js';
import { CONTENT as symbolAbTest } from './symbol-ab-test.js';
import {
  CONTENT as customBreakpoints,
  CONTENT_RESET as customBreakpointsReset,
} from './custom-breakpoints.js';
import { CONTENT as reactiveState } from './reactive-state.js';
import { CONTENT as showHideIf } from './show-hide-if.js';
import { CONTENT as textBlock } from './text-block.js';
import { CONTENT as stateBinding } from './state-binding.js';
import type { BuilderContent } from './types.js';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

const pages = {
  '/': homepage,
  '/api-version-v1': CONTENT_WITHOUT_SYMBOLS,
  '/api-version-v2': CONTENT_WITHOUT_SYMBOLS,
  '/api-version-v3': CONTENT_WITHOUT_SYMBOLS,
  '/api-version-default': CONTENT_WITHOUT_SYMBOLS,
  '/can-track-false': homepage,
  '/css-nesting': cssNesting,
  '/columns': columns,
  '/symbols': symbols,
  '/symbols-without-content': CONTENT_WITHOUT_SYMBOLS,
  '/symbol-bindings': symbolBindings,
  '/symbol-with-locale': symbolWithLocale,
  '/link-url': linkUrl,
  '/symbol-with-input-binding': symbolWithInputBinding,
  '/content-bindings': contentBindings,
  '/image': image,
  '/data-bindings': dataBindings,
  '/data-binding-styles': dataBindingStyles,
  '/ab-test': abTest,
  '/symbol-ab-test': symbolAbTest,
  '/custom-breakpoints': customBreakpoints,
  '/reactive-state': reactiveState,
  '/element-events': elementEvents,
  '/show-hide-if': showHideIf,
  '/custom-breakpoints-reset': customBreakpointsReset,
  '/text-block': textBlock,
  '/state-binding': stateBinding,
} as const;

const apiVersionPathToProp = {
  '/api-version-v1': { apiVersion: 'v1' },
  '/api-version-v2': { apiVersion: 'v2' },
  '/api-version-v3': { apiVersion: 'v3' },
} as const;

export type Path = keyof typeof pages;

const GEN1_ONLY_PATHNAMES: Path[] = ['/api-version-v1'];
const GEN2_ONLY_PATHNAMES: Path[] = ['/api-version-v2'];

export const getAllPathnames = (target: 'gen1' | 'gen2'): string[] => {
  return Object.keys(pages).filter(pathname => {
    if (target === 'gen1') {
      return !GEN2_ONLY_PATHNAMES.includes(pathname as Path);
    } else {
      return !GEN1_ONLY_PATHNAMES.includes(pathname as Path);
    }
  });
};

const getContentForPathname = (pathname: string): BuilderContent | null => {
  return pages[pathname as keyof typeof pages] || null;
};

// remove trailing slash from pathname if it exists
// unless it's the root path
const normalizePathname = (pathname: string): string =>
  pathname === '/' ? pathname : pathname.replace(/\/$/, '');

export const getAPIKey = (): string => 'abcd';
const REAL_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

type ContentResponse = { results: BuilderContent[] };

export const getProps = async (args: {
  pathname?: string;
  _processContentResult?: (options: any, content: ContentResponse) => Promise<ContentResponse>;
  getContent?: (opts: any) => Promise<BuilderContent | null>;
  options?: any;
  data?: 'real' | 'mock';
}) => {
  const {
    pathname: _pathname = getPathnameFromWindow(),
    _processContentResult,
    data = 'mock',
    getContent,
    options,
  } = args;
  const pathname = normalizePathname(_pathname);

  if (data === 'real' && getContent) {
    return {
      model: 'page',
      apiKey: REAL_API_KEY,
      content: await getContent({
        model: 'page',
        apiKey: REAL_API_KEY,
        userAttributes: { urlPath: pathname },
        options,
      }),
    };
  }
  const _content = getContentForPathname(pathname);

  if (!_content) {
    return null;
  }

  const extraProps =
    pathname === '/can-track-false'
      ? {
          canTrack: false,
        }
      : {};

  const extraApiVersionProp =
    apiVersionPathToProp[pathname as keyof typeof apiVersionPathToProp] ?? {};

  const props = {
    apiKey: getAPIKey(),
    model: 'page',
    ...extraProps,
    ...extraApiVersionProp,
  };

  const content = _processContentResult
    ? (await _processContentResult(props, { results: [_content] })).results[0]
    : _content;

  return { ...props, content } as any;
};
