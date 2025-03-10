import { AB_TEST_INTERACTIVE } from './ab-test-interactive.js';
import { CONTENT as abTest } from './ab-test.js';
import { CONTENT as personalizatContainer } from './personalization-container.js';
import { ANIMATIONS } from './animations.js';
import { COLUMNS } from './columns.js';
import { CONTENT as contentBindings } from './content-bindings.js';
import { CONTENT as contentInputBindings } from './content-input-bindings.js';
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
import { HOMEPAGE } from './homepage.js';
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
import {
  ACCORDION,
  ACCORDION_GRID,
  ACCORDION_ONE_AT_A_TIME,
  ACCORDION_WITH_NO_DETAIL,
} from './accordion.js';
import { SYMBOL_TRACKING } from './symbol-tracking.js';
import { COLUMNS_WITH_DIFFERENT_WIDTHS } from './columns-with-different-widths.js';
import { CUSTOM_COMPONENTS_MODELS_RESTRICTION } from './custom-components-models.js';
import { EDITING_BOX_TO_COLUMN_INNER_LAYOUT } from './editing-columns-inner-layout.js';
import { REACT_NATIVE_STRICT_STYLE_MODE_CONTENT } from './react-native-strict-style-mode.js';
import { SDK_MAP, type Generation, type Sdk, type ServerName } from '../helpers/sdk.js';
import { SYMBOL_WITH_REPEAT_INPUT_BINDING } from './symbol-with-repeat-input-binding.js';
import { CUSTOM_COMPONENT_CHILDREN_SLOT_PLACEMENT } from './children-slot-placement.js';
import { DYNAMIC_LOADING_CUSTOM_COMPONENTS } from './dynamic-loading.js';
import { SSR_BINDING_CONTENT } from './ssr-binding.js';
import { EAGER_DYNAMIC_LOADING_CUSTOM_COMPONENTS } from './eager-dynamic-loading.js';
import { BLOCKS_CLASS_NAME } from './blocks-class-name.js';
import { DUPLICATED_CONTENT_USING_NESTED_SYMBOLS } from './duplicated-content-using-nested-symbols.js';
import { CUSTOM_COMPONENTS_NOWRAP } from './custom-components-nowrap.js';
import { XSS_EXPLOIT } from './xss-exploit.js';
import { COUNTDOWN } from './countdown.js';
import { LOCALIZATION, LOCALIZATION_WITHOUT_LOCALE_PROP } from './localization.js';
import { LOCALIZATION_SUBFIELDS } from './localization-subfields.js';
import {
  VARIANT_CONTAINERS,
  VARIANT_CONTAINERS_WITH_PREVIEWING_INDEX_1,
  VARIANT_CONTAINERS_WITH_PREVIEWING_INDEX_UNDEFINED,
} from './variant-containers.js';
import { EMBED_AND_CUSTOM_CODE } from './embed-and-custom-code.js';
import { VIDEO_LAZY_LOAD } from './video-lazy-load.js';
import { COLUMNS_VERTICAL_CENTER_FLEX } from './columns-vertical-center-flex.js';
import { DYNAMIC_ELEMENT } from './dynamic-element.js';
import { CUSTOM_CODE_DOM_UPDATE } from './custom-code-dom-update.js';
import { NEW_BLOCK_ADD } from './new-block-add.js';

import { DYNAMIC_BUTTON } from './dynamic-button.js';
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

const getPathnameFromWindow = (): string => (isBrowser() ? window.location.pathname : '');

type Page = {
  content: BuilderContent;
  /**
   * The e2e servers that this page should be tested against. This is important because certain frameworks
   * (like NextJS) will pre-render all possible pages on the server. If a test is not meant to work in a specific app,
   * then that app will fail to build when attempting to pre-render the page.
   *
   * Defaults to `all`.
   */
  target?: (Generation | ServerName)[] | Generation | ServerName | 'all';
  /**
   * To test visual editing in Gen 1 SDK, we cannot provide a hardcoded JSON.
   * Instead, we have to let the SDK fetch the data from the API and mock the
   * network request instead.
   * NOTE: This is why I can only test visual editing for the old SDK when using a non-SSR app
   */
  isGen1VisualEditingTest?: boolean;
};

export const PAGES: Record<string, Page> = {
  '/': { content: HOMEPAGE },
  '/editing': { content: HOMEPAGE, isGen1VisualEditingTest: true },
  '/editing-with-top-padding': { content: HOMEPAGE, isGen1VisualEditingTest: true },
  '/api-version-v3': { content: CONTENT_WITHOUT_SYMBOLS },
  '/api-version-default': { content: CONTENT_WITHOUT_SYMBOLS },
  '/can-track-false': { content: HOMEPAGE },
  '/css-nesting': { content: cssNesting },
  '/columns': { content: COLUMNS },
  '/symbols': { content: symbols },
  '/js-code': { content: JS_CODE_CONTENT },
  '/symbols-without-content': { content: CONTENT_WITHOUT_SYMBOLS },
  '/symbol-bindings': { content: symbolBindings },
  '/symbol-with-locale': { content: symbolWithLocale },
  '/link-url': { content: linkUrl },
  '/symbol-with-input-binding': { content: symbolWithInputBinding },
  '/content-bindings': { content: contentBindings },
  '/content-input-bindings': { content: contentInputBindings, isGen1VisualEditingTest: true },
  '/image': { content: image },
  '/image-high-priority': { content: imageHighPriority },
  '/image-no-webp': { content: imageNoWebp },
  '/data-bindings': { content: dataBindings },
  '/data-binding-styles': { content: dataBindingStyles },
  '/react-native-strict-style-mode': { content: REACT_NATIVE_STRICT_STYLE_MODE_CONTENT },
  '/react-native-strict-style-mode-disabled': { content: REACT_NATIVE_STRICT_STYLE_MODE_CONTENT },
  '/ab-test': { content: abTest },
  '/ab-test-interactive': { content: AB_TEST_INTERACTIVE },
  '/http-requests': { content: HTTP_REQUESTS },
  '/symbol-ab-test': { content: symbolAbTest },
  '/custom-breakpoints': { content: customBreakpoints },
  '/reactive-state': { content: REACTIVE_STATE_CONTENT },
  '/large-reactive-state': { content: LARGE_REACTIVE_STATE_CONTENT },
  '/large-reactive-state-editing': {
    content: LARGE_REACTIVE_STATE_CONTENT,
    isGen1VisualEditingTest: true,
  },
  '/element-events': { content: elementEvents },
  '/external-data': { content: EXTERNAL_DATA },
  '/show-hide-if': { content: SHOW_HIDE_IF },
  '/show-hide-if-repeats': { content: SHOW_HIDE_IF_REPEATS },
  '/custom-breakpoints-reset': { content: customBreakpointsReset },
  '/text-block': { content: textBlock },
  '/text-eval': { content: textEval },
  '/state-binding': { content: stateBinding },
  '/nested-symbols': { content: nestedSymbols },
  '/personalization-container': {
    content: personalizatContainer,
    target: [
      'gen1',
      'react',
      'react-sdk-next-14-app',
      'react-sdk-next-15-app',
      'react-sdk-next-pages',
    ],
  },
  '/editing-styles': { content: EDITING_STYLES, isGen1VisualEditingTest: true },
  '/video': { content: video },
  '/repeat-items-bindings': { content: REPEAT_ITEMS_BINDINGS },
  '/input-default-value': { content: INPUT_DEFAULT_VALUE },
  '/duplicate-attributes': { content: DUPLICATE_ATTRIBUTES },
  '/js-content-is-browser': { content: JS_CONTENT_IS_BROWSER },
  '/slot': { content: SLOT },
  '/slot-with-symbol': { content: SLOT_WITH_SYMBOL },
  '/slot-without-symbol': { content: SLOT_WITHOUT_SYMBOL },
  '/no-trusted-hosts': { content: HOMEPAGE, isGen1VisualEditingTest: true },
  '/editing-styles-no-trusted-hosts': { content: EDITING_STYLES, isGen1VisualEditingTest: true },
  '/animations': { content: ANIMATIONS },
  '/data-preview': { content: DATA_PREVIEW },
  '/form': { content: FORM },
  '/default-styles': { content: DEFAULT_STYLES },
  '/css-properties': { content: CSS_PROPERTIES },
  '/hover-animation': { content: HOVER_ANIMATION },
  '/tabs': { content: TABS },
  '/custom-components': { content: CUSTOM_COMPONENTS },
  '/basic-styles': { content: BASIC_STYLES },
  '/accordion': { content: ACCORDION },
  '/accordion-one-at-a-time': { content: ACCORDION_ONE_AT_A_TIME },
  '/accordion-grid': { content: ACCORDION_GRID },
  '/accordion-no-detail': { content: ACCORDION_WITH_NO_DETAIL },
  '/symbol-tracking': { content: SYMBOL_TRACKING },
  '/columns-with-different-widths': { content: COLUMNS_WITH_DIFFERENT_WIDTHS },
  '/custom-components-models-show': {
    content: CUSTOM_COMPONENTS_MODELS_RESTRICTION,
    target: ['react'],
  },
  '/custom-components-models-not-show': {
    content: CUSTOM_COMPONENTS_MODELS_RESTRICTION,
    target: ['react'],
  },
  '/editing-box-columns-inner-layout': { content: EDITING_BOX_TO_COLUMN_INNER_LAYOUT },
  '/with-fetch-options': { content: HOMEPAGE },
  '/symbol-with-repeat-input-binding': { content: SYMBOL_WITH_REPEAT_INPUT_BINDING },
  '/children-slot-placement': { content: CUSTOM_COMPONENT_CHILDREN_SLOT_PLACEMENT },
  '/dynamic-loading': { content: DYNAMIC_LOADING_CUSTOM_COMPONENTS, target: ['sveltekit'] },
  '/eager-dynamic-loading': {
    content: EAGER_DYNAMIC_LOADING_CUSTOM_COMPONENTS,
    target: ['sveltekit'],
  },
  '/ssr-binding': { content: SSR_BINDING_CONTENT },
  '/blocks-class-name': { content: BLOCKS_CLASS_NAME },
  '/duplicated-content-using-nested-symbols': { content: DUPLICATED_CONTENT_USING_NESTED_SYMBOLS },
  '/custom-components-nowrap': {
    content: CUSTOM_COMPONENTS_NOWRAP,
    target: ['angular-16', 'angular-16-ssr', 'angular-19-ssr'],
  },
  /**
   * For some reason, the `HTTP_REQUESTS` content is missing some values when
   * used in the react-next-pages e2e test.
   *
   * This is a workaround to clone the content in case it's accidentally mutated by some other test.
   */
  '/override-base-url': { content: JSON.parse(JSON.stringify(HTTP_REQUESTS)) },
  '/xss-exploit': { content: XSS_EXPLOIT },
  '/symbol-with-jscode': { content: COUNTDOWN },
  '/get-content': { content: HTTP_REQUESTS, target: 'gen1' },
  '/get-query': { content: HTTP_REQUESTS, target: 'gen1' },
  '/localization-locale-passed': { content: LOCALIZATION },
  '/localization-locale-not-passed': { content: LOCALIZATION_WITHOUT_LOCALE_PROP },
  '/localization-subfields': { content: LOCALIZATION_SUBFIELDS, target: ['react', 'gen1-react'] },
  '/get-content-with-symbol': { content: CONTENT_WITHOUT_SYMBOLS, target: 'gen1' },
  '/editing-empty-content-element-ref': {
    content: null as unknown as BuilderContent,
    target: ['svelte', 'sveltekit', 'vue', 'nuxt', 'qwik-city'],
  },
  '/embed-and-custom-code': { content: EMBED_AND_CUSTOM_CODE },
  '/video-lazy-load': { content: VIDEO_LAZY_LOAD },
  '/variant-containers': {
    content: VARIANT_CONTAINERS,
    target: [
      'react-sdk-next-15-app',
      'gen1-next15-app',
      'react-sdk-next-pages',
      'gen1-next14-pages',
    ],
  },
  '/variant-containers-with-previewing-index-0': {
    content: VARIANT_CONTAINERS,
    target: [
      'react-sdk-next-15-app',
      'gen1-next15-app',
      'react-sdk-next-pages',
      'gen1-next14-pages',
    ],
  },
  '/variant-containers-with-previewing-index-1': {
    content: VARIANT_CONTAINERS_WITH_PREVIEWING_INDEX_1,
    target: [
      'react-sdk-next-15-app',
      'gen1-next15-app',
      'react-sdk-next-pages',
      'gen1-next14-pages',
    ],
  },
  '/variant-containers-with-previewing-index-undefined': {
    content: VARIANT_CONTAINERS_WITH_PREVIEWING_INDEX_UNDEFINED,
    target: [
      'react-sdk-next-15-app',
      'gen1-next15-app',
      'react-sdk-next-pages',
      'gen1-next14-pages',
    ],
  },
  '/columns-vertical-center-flex': { content: COLUMNS_VERTICAL_CENTER_FLEX },
  '/can-track-false-pre-init': { content: HOMEPAGE, target: 'gen1' },
  '/dynamic-element': { content: DYNAMIC_ELEMENT },
  '/custom-code-dom-update': { content: CUSTOM_CODE_DOM_UPDATE },
  '/new-block-add': { content: NEW_BLOCK_ADD },
  '/dynamic-button': { content: DYNAMIC_BUTTON },
} as const;

export type Path = keyof typeof PAGES;

export const getAllPathnames = (target: ServerName): string[] => {
  return Object.entries(PAGES)
    .filter(([_, page]) => {
      const pageTarget = !page.target
        ? ['all']
        : Array.isArray(page.target)
          ? page.target
          : [page.target];

      return (
        pageTarget.includes(target) ||
        pageTarget.includes(SDK_MAP[target].gen) ||
        pageTarget.includes('all')
      );
    })
    .map(([pathname]) => pathname);
};

const getContentForPathname = (pathname: string): BuilderContent | null => {
  return PAGES[pathname]?.content || null;
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

  if (args.sdk === 'oldReact' && PAGES[pathname]?.isGen1VisualEditingTest) {
    // `null` on purpose to enable editing. This causes the gen1 SDK to make a network request.
    // which Playwright will intercept and provide the content itself.
    _content = null;
  }

  let extraProps = {};
  switch (pathname) {
    case '/api-version-v3':
      extraProps = {
        apiVersion: 'v3',
      };
      break;
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
    case '/get-content':
    case '/get-content-with-symbol':
      extraProps = {
        apiEndpoint: 'content',
      };
      break;
    case '/get-query':
      extraProps = {
        options: { apiEndpoint: 'query', format: 'html', model: 'abcd', key: 'abcd' },
      };
      break;
    case '/symbol-with-repeat-input-binding':
      extraProps = {
        data: { products: [{ header: 'title1' }, { header: 'title2' }, { header: 'title3' }] },
      };
      break;
    case '/duplicated-content-using-nested-symbols':
      extraProps = {
        model: 'symbol',
      };
      break;
    case '/override-base-url':
      extraProps = {
        apiHost: 'https://cdn-qa.builder.io',
      };
      break;
    case '/localization-locale-passed':
    case '/localization-subfields':
      extraProps = {
        locale: 'hi-IN',
      };
      break;
    case '/editing-with-top-padding':
      extraProps = {
        addTopPadding: true,
      };
      break;
    default:
      break;
  }

  const props = {
    apiKey: getAPIKey(data),
    model: 'page',
    ...extraProps,
  };

  const content = _content
    ? _processContentResult
      ? (await _processContentResult(props, { results: [_content] }))[0]
      : _content
    : undefined;

  return { ...props, content } as any;
};
