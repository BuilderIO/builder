import { AB_TEST_INTERACTIVE } from './ab-test-interactive.js';
import { CONTENT as abTest } from './ab-test.js';
import { CONTENT as personalizatContainer } from './personalization-container.js';
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
import {
  CONTENT as image,
  CONTENT_2 as imageHighPriority,
  CONTENT_3 as imageNoWebp,
} from './image.js';
import { INPUT_DEFAULT_VALUE } from './input-default-value.js';
import { JS_CODE_CONTENT } from './js-code.js';
import { JS_CONTENT_IS_BROWSER } from './js-content-is-browser.js';
import { CONTENT as linkUrl } from './link-url.js';
import { CONTENT as nestedSymbols } from './nested-symbols.js';
import { REACTIVE_STATE_CONTENT } from './reactive-state.js';
import { LARGE_REACTIVE_STATE_CONTENT } from './large-reactive-state.js';
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
import { CONTENT as textEval } from './text-eval.js';
import type { BuilderContent } from './types.js';
import { CONTENT as video } from './video.js';
import { CUSTOM_COMPONENTS } from './custom-components.js';
import { BASIC_STYLES } from './basic-styles.js';
import { ACCORDION, ACCORDION_GRID, ACCORDION_ONE_AT_A_TIME } from './accordion.js';
import { SYMBOL_TRACKING } from './symbol-tracking.js';
import { COLUMNS_WITH_DIFFERENT_WIDTHS } from './columns-with-different-widths.js';
import { CUSTOM_COMPONENTS_MODELS_RESTRICTION } from './custom-components-models.js';
import { EDITING_BOX_TO_COLUMN_INNER_LAYOUT } from './editing-columns-inner-layout.js';
import { REACT_NATIVE_STRICT_STYLE_MODE_CONTENT } from './react-native-strict-style-mode.js';
import type { Sdk } from '../helpers/sdk.js';
import { SYMBOL_WITH_REPEAT_INPUT_BINDING } from './symbol-with-repeat-input-binding.js';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

export const PAGES = {
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
  '/image-high-priority': imageHighPriority,
  '/image-no-webp': imageNoWebp,
  '/data-bindings': dataBindings,
  '/data-binding-styles': dataBindingStyles,
  '/react-native-strict-style-mode': REACT_NATIVE_STRICT_STYLE_MODE_CONTENT,
  '/react-native-strict-style-mode-disabled': REACT_NATIVE_STRICT_STYLE_MODE_CONTENT,
  '/ab-test': abTest,
  '/ab-test-interactive': AB_TEST_INTERACTIVE,
  '/http-requests': HTTP_REQUESTS,
  '/symbol-ab-test': symbolAbTest,
  '/custom-breakpoints': customBreakpoints,
  '/reactive-state': REACTIVE_STATE_CONTENT,
  '/large-reactive-state': LARGE_REACTIVE_STATE_CONTENT,
  '/large-reactive-state-editing': LARGE_REACTIVE_STATE_CONTENT,
  '/element-events': elementEvents,
  '/external-data': EXTERNAL_DATA,
  '/show-hide-if': SHOW_HIDE_IF,
  '/show-hide-if-repeats': SHOW_HIDE_IF_REPEATS,
  '/custom-breakpoints-reset': customBreakpointsReset,
  '/text-block': textBlock,
  '/text-eval': textEval,
  '/state-binding': stateBinding,
  '/nested-symbols': nestedSymbols,
  '/personalization-container': personalizatContainer,
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
  '/symbol-tracking': SYMBOL_TRACKING,
  '/columns-with-different-widths': COLUMNS_WITH_DIFFERENT_WIDTHS,
  '/custom-components-models-show': CUSTOM_COMPONENTS_MODELS_RESTRICTION,
  '/custom-components-models-not-show': CUSTOM_COMPONENTS_MODELS_RESTRICTION,
  '/editing-box-columns-inner-layout': EDITING_BOX_TO_COLUMN_INNER_LAYOUT,
  '/symbol-with-repeat-input-binding': SYMBOL_WITH_REPEAT_INPUT_BINDING,
} as const;

const apiVersionPathToProp = {
  '/api-version-v1': { apiVersion: 'v1' },
  '/api-version-v3': { apiVersion: 'v3' },
} as const;

export type Path = keyof typeof PAGES;

const GEN1_ONLY_PATHNAMES: Path[] = ['/api-version-v1', '/personalization-container'];
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

export const getAPIKey = (type: 'real' | 'mock' = 'mock'): string =>
  type === 'real' ? REAL_API_KEY : 'abcd';

const REAL_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660';

type ContentResponse = { results: BuilderContent[] };

export const getProps = async (args: {
  sdk?: Sdk;
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

  let _content = getContentForPathname(pathname);

  if (args.sdk === 'oldReact' && pathname === '/large-reactive-state-editing') {
    // `undefined` on purpose to enable editing. This causes the gen1 SDK to make a network request.
    // which Playwright will intercept and provide the content itself.
    _content = null;
  }

  let extraProps = {};
  switch (pathname) {
    case '/can-track-false':
    case '/symbol-tracking':
      extraProps = {
        canTrack: false,
      };
      break;
    case '/no-trusted-hosts':
    case '/editing-styles-no-trusted-hosts':
      extraProps = {
        trustedHosts: [],
      };
      break;
    case '/custom-components-models-show':
      // overrides page model below
      extraProps = {
        model: 'test-model',
      };
      break;
    case '/react-native-strict-style-mode':
      extraProps = {
        strictStyleMode: true,
      };
      break;
    case '/symbol-with-repeat-input-binding':
      extraProps = {
        data: { products: [{ header: 'title1' }, { header: 'title2' }, { header: 'title3' }] },
      };
      break;
    default:
      break;
  }

  const extraApiVersionProp =
    apiVersionPathToProp[pathname as keyof typeof apiVersionPathToProp] ?? {};

  const props = {
    apiKey: getAPIKey(data),
    model: 'page',
    ...extraProps,
    ...extraApiVersionProp,
  };

  const content = _content
    ? _processContentResult
      ? (await _processContentResult(props, { results: [_content] }))[0]
      : _content
    : undefined;

  return { ...props, content } as any;
};
