import { AB_TEST_INTERACTIVE } from './ab-test-interactive.js';
import { CONTENT as abTest } from './ab-test.js';
import { ANIMATIONS } from './animations.js';
import { CONTENT as columns } from './columns.js';
import { CONTENT as contentBindings } from './content-bindings.js';
import { CONTENT as cssNesting } from './css-nesting.js';
import { CSS_PROPERTIES } from './css-properties.js';
import {
  CONTENT as customBreakpoints,
  CONTENT_RESET as customBreakpointsReset,
} from './custom-breakpoints.js';
import { CONTENT as dataBindingStyles } from './data-binding-styles.js';
import { CONTENT as dataBindings } from './data-bindings.js';
import { DATA_PREVIEW } from './data-preview.js';
import { DEFAULT_STYLES } from './default-styles.js';
import { DUPLICATE_ATTRIBUTES } from './duplicate-attributes.js';
import { EDITING_STYLES } from './editing-styles.js';
import { CONTENT as elementEvents } from './element-events.js';
import { EXTERNAL_DATA } from './external-data.js';
import { FORM } from './form.js';
import { CONTENT as homepage } from './homepage.js';
import { HOVER_ANIMATION } from './hover-animation.js';
import { HTTP_REQUESTS } from './http-requests.js';
import { CONTENT as image } from './image.js';
import { INPUT_DEFAULT_VALUE } from './input-default-value.js';
import { JS_CODE_CONTENT } from './js-code.js';
import { JS_CONTENT_IS_BROWSER } from './js-content-is-browser.js';
import { CONTENT as linkUrl } from './link-url.js';
import { CONTENT as nestedSymbols } from './nested-symbols.js';
import { CONTENT as reactiveState } from './reactive-state.js';
import { REPEAT_ITEMS_BINDINGS } from './repeat-items-bindings.js';
import { SHOW_HIDE_IF_REPEATS } from './show-hide-if-repeat.js';
import { SHOW_HIDE_IF } from './show-hide-if.js';
import { SLOT_WITHOUT_SYMBOL, SLOT_WITH_SYMBOL } from './slot-with-symbol.js';
import { SLOT } from './slot.js';
import { CONTENT as stateBinding } from './state-binding.js';
import { CONTENT as symbolAbTest } from './symbol-ab-test.js';
import { CONTENT as symbolBindings } from './symbol-bindings.js';
import { CONTENT as symbolWithInputBinding } from './symbol-with-input-binding.js';
import { CONTENT as symbolWithLocale } from './symbol-with-locale.js';
import { CONTENT_WITHOUT_SYMBOLS, CONTENT as symbols } from './symbols.js';
import { TABS } from './tabs.js';
import { CONTENT as textBlock } from './text-block.js';
import type { BuilderContent } from './types.js';
import { CONTENT as video } from './video.js';
import { CUSTOM_COMPONENTS } from './custom-components.js';
import { BASIC_STYLES } from './basic-styles.js';
import { ACCORDION, ACCORDION_GRID, ACCORDION_ONE_AT_A_TIME } from './accordion.js';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

const PAGES = {
  '/': homepage,
  '/api-version-v1': CONTENT_WITHOUT_SYMBOLS,
  '/api-version-v3': CONTENT_WITHOUT_SYMBOLS,
  '/api-version-default': CONTENT_WITHOUT_SYMBOLS,
  '/can-track-false': homepage,
  '/css-nesting': cssNesting,
  '/columns': columns,
  '/symbols': symbols,
  '/js-code': JS_CODE_CONTENT,
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
  '/ab-test-interactive': AB_TEST_INTERACTIVE,
  '/http-requests': HTTP_REQUESTS,
  '/symbol-ab-test': symbolAbTest,
  '/custom-breakpoints': customBreakpoints,
  '/reactive-state': reactiveState,
  '/element-events': elementEvents,
  '/external-data': EXTERNAL_DATA,
  '/show-hide-if': SHOW_HIDE_IF,
  '/show-hide-if-repeats': SHOW_HIDE_IF_REPEATS,
  '/custom-breakpoints-reset': customBreakpointsReset,
  '/text-block': textBlock,
  '/state-binding': stateBinding,
  '/nested-symbols': nestedSymbols,
  '/editing-styles': EDITING_STYLES,
  '/video': video,
  '/repeat-items-bindings': REPEAT_ITEMS_BINDINGS,
  '/input-default-value': INPUT_DEFAULT_VALUE,
  '/duplicate-attributes': DUPLICATE_ATTRIBUTES,
  '/js-content-is-browser': JS_CONTENT_IS_BROWSER,
  '/slot': SLOT,
  '/slot-with-symbol': SLOT_WITH_SYMBOL,
  '/slot-without-symbol': SLOT_WITHOUT_SYMBOL,
  '/no-trusted-hosts': homepage,
  '/editing-styles-no-trusted-hosts': EDITING_STYLES,
  '/animations': ANIMATIONS,
  '/data-preview': DATA_PREVIEW,
  '/form': FORM,
  '/default-styles': DEFAULT_STYLES,
  '/css-properties': CSS_PROPERTIES,
  '/hover-animation': HOVER_ANIMATION,
  '/tabs': TABS,
  '/custom-components': CUSTOM_COMPONENTS,
  '/basic-styles': BASIC_STYLES,
  '/accordion': ACCORDION,
  '/accordion-one-at-a-time': ACCORDION_ONE_AT_A_TIME,
  '/accordion-grid': ACCORDION_GRID,
} as const;

const apiVersionPathToProp = {
  '/api-version-v1': { apiVersion: 'v1' },
  '/api-version-v3': { apiVersion: 'v3' },
} as const;

export type Path = keyof typeof PAGES;

const GEN1_ONLY_PATHNAMES: Path[] = ['/api-version-v1'];
const GEN2_ONLY_PATHNAMES: Path[] = [];

export const getAllPathnames = (target: 'gen1' | 'gen2'): string[] => {
  return Object.keys(PAGES).filter(pathname => {
    if (target === 'gen1') {
      return !GEN2_ONLY_PATHNAMES.includes(pathname as Path);
    } else {
      return !GEN1_ONLY_PATHNAMES.includes(pathname as Path);
    }
  });
};

const getContentForPathname = (pathname: string): BuilderContent | null => {
  return PAGES[pathname as keyof typeof PAGES] || null;
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
  _processContentResult?: (options: any, content: ContentResponse) => Promise<BuilderContent[]>;
  fetchOneEntry?: (opts: any) => Promise<BuilderContent | null>;
  options?: any;
  data?: 'real' | 'mock';
  apiKey?: string;
}) => {
  const {
    pathname: _pathname = getPathnameFromWindow(),
    _processContentResult,
    data = 'mock',
    fetchOneEntry,
    options,
    apiKey,
  } = args;
  const pathname = normalizePathname(_pathname);

  if (data === 'real' && fetchOneEntry) {
    return {
      model: 'page',
      apiKey: apiKey || REAL_API_KEY,
      content: await fetchOneEntry({
        model: 'page',
        apiKey: apiKey || REAL_API_KEY,
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
      : pathname.includes('no-trusted-hosts')
        ? {
            trustedHosts: [],
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
    ? (await _processContentResult(props, { results: [_content] }))[0]
    : _content;

  return { ...props, content } as any;
};
