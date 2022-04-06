import React from 'react';
import ReactDOM from 'react-dom';
import { jsx, css } from '@emotion/core';
import { BuilderContent, getContentWithInfo } from './builder-content.component';
import { BuilderBlocks } from './builder-blocks.component';
import {
  Builder,
  GetContentOptions,
  builder,
  Subscription,
  BehaviorSubject,
  BuilderElement,
  BuilderContent as Content,
} from '@builder.io/sdk';
import { BuilderStoreContext } from '../store/builder-store';
import hash from 'hash-sum';
import onChange from '../../lib/on-change';

export { onChange };

import { sizes } from '../constants/device-sizes.constant';
import {
  BuilderAsyncRequestsContext,
  RequestOrPromise,
  RequestInfo,
  isRequestInfo,
} from '../store/builder-async-requests';
import { Url } from 'url';
import { debounceNextTick } from '../functions/debonce-next-tick';
import { throttle } from '../functions/throttle';
import { safeDynamicRequire } from '../functions/safe-dynamic-require';
import { BuilderMetaContext } from '../store/builder-meta';

function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {};
  keys.forEach(key => {
    ret[key] = obj[key];
  });
  return ret;
}
function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const ret: any = { ...obj };
  keys.forEach(key => {
    delete ret[key];
  });
  return ret;
}

const wrapComponent = (info: any) => {
  return (props: any) => {
    // TODO: convention for all of this, like builderTagProps={{ style: {} foo: 'bar' }}
    const Tag = props.builderTag || 'div';
    const inputNames = ['children'].concat(
      info.inputs?.map((item: any) => item.name as string) || []
    );

    const baseProps = omit(props, ...inputNames, 'attributes');
    const inputProps = props; // pick(props, ...inputNames);

    if (info.noWrap) {
      return <info.class attributes={baseProps} {...inputProps} />;
    }

    return (
      <Tag {...baseProps}>
        <info.class {...inputProps} />
      </Tag>
    );
  };
};

const size = (thing: object) => Object.keys(thing).length;

function debounce(func: Function, wait: number, immediate = false) {
  let timeout: any;
  return function (this: any) {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

const fontsLoaded = new Set();

// TODO: get fetch from core JS....
const fetch = Builder.isBrowser ? window.fetch : require('node-fetch');

const sizeMap = {
  desktop: 'large',
  tablet: 'medium',
  mobile: 'small',
};

function decorator(fn: Function) {
  return function argReceiver(...fnArgs: any[]) {
    // Check if the decorator is being called without arguments (ex `@foo methodName() {}`)
    if (fnArgs.length === 3) {
      const [target, key, descriptor] = fnArgs;
      if (descriptor && (descriptor.value || descriptor.get)) {
        fnArgs = [];
        return descriptorChecker(target, key, descriptor);
      }
    }

    return descriptorChecker;

    // descriptorChecker determines whether a method or getter is being decorated
    // and replaces the appropriate key with the decorated function.
    function descriptorChecker(target: any, key: any, descriptor: any) {
      const descriptorKey = descriptor.value ? 'value' : 'get';
      return {
        ...descriptor,
        [descriptorKey]: fn(descriptor[descriptorKey], ...fnArgs),
      };
    }
  };
}

const fetchCache: { [key: string]: any } = {};

export interface BuilderComponentProps {
  /**
   * @package
   * @deprecated use {@link model} instead.
   */
  modelName?: string;
  /**
   * Name of the model this is rendering content for. Default is "page".
   */
  model?: string;
  /**
   * @package
   * @deprecated use {@link model} instead.
   */
  name?: string;
  /**
   * Data is passed along as `state.*` to the component.
   * @see {@link https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down}
   *
   * @example
   * ```
   * <BuilderComponent
   *  model="page"
   *  data={{
   *    products: productsList,
   *    myFunction: () => alert('Triggered!'),
   *    foo: 'bar'
   *  }} >
   * ```
   */
  data?: any;
  /**
   * Specific instance of Builder that should be used. You might use this for
   * server side rendering. It's generally not recommended except for very
   * advanced multi-tenant use cases.
   */
  builder?: Builder;
  /**
   * Content entry ID for this component to fetch client side
   */
  entry?: string;
  /**
   * @package
   *
   * Builder public API key.
   *
   * @see {@link builder.init()} for the preferred way of supplying your API key.
   */
  apiKey?: string;
  /**
   * @private
   */
  codegen?: boolean;
  options?: GetContentOptions;
  /**
   * Function callback invoked with `data` and your content when it becomes
   * available.
   *
   * @see {@link https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down}
   */
  contentLoaded?: (data: any, content: Content) => void;
  /**
   * Instead of having Builder render a link for you with plain anchor
   * elements, use your own function. Useful when using Next.js, Gatsby, or
   * other client side routers' custom `<Link>` components.
   *
   * ## Notes
   *
   * This must be a function that returns JSX, not a component!
   *
   * ## Examples
   *
   * @see {@link https://github.com/BuilderIO/builder/blob/0f0bc1ca835335f99fc21efb20ff3c4836bc9f41/examples/next-js-builder-site/src/functions/render-link.tsx#L6}
   */
  renderLink?: (props: React.AnchorHTMLAttributes<any>) => React.ReactNode;
  /**
   * Callback to run if an error occurred while fetching content.
   */
  contentError?: (error: any) => void;
  /**
   * Manually specify what Builder content JSON object to render. @see {@link
   * https://github.com/BuilderIO/builder/tree/master/packages/react#passing-content-manually}
   */
  content?: Content;
  /**
   * @package
   *
   * Location object that provides the current url, path, etc; for server side
   * rendering.
   */
  location?: Location | Url;
  /**
   * Callback to run when Builder state changes (e.g. state.foo = 'bar' in an
   * action)
   */
  onStateChange?: (newData: any) => void;
  /**
   * @package
   * @deprecated
   */
  noAsync?: boolean;
  /**
   * @package
   *
   * Flag to render email content (small differences in our render logic for
   * email support).
   */
  emailMode?: boolean;
  /**
   * @package
   *
   * Flag to render amp content (small differences in our render logic for amp
   * support)
   */
  ampMode?: boolean;
  /**
   * @package
   *
   * Render content in-line only (can't passed from the content prop) don't
   * fetch content from our API.
   */
  inlineContent?: boolean;
  /**
   * @package
   * @deprecated
   */
  builderBlock?: BuilderElement;
  /**
   * @package
   * @deprecated
   */
  dataOnly?: boolean;
  /**
   * @package
   * @deprecated
   */
  hydrate?: boolean;
  /**
   * @package
   * @deprecated use {@link Builder.isStatic} instead
   */
  isStatic?: boolean;
  /**
   * Object that will be available in actions and bindings.
   *
   * @see {@link https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down}
   */
  context?: any;
  /**
   * @deprecated
   */
  url?: string;
  /**
   * Set to true if this is not the root content component, for instance for symbols
   */
  isChild?: boolean;
  /**
   * Set to true to not call `event.stopPropagation()` in the editor to avoid
   * issues with client site routing triggering when editing in Builder, causing
   * navigation to other pages unintended
   */
  stopClickPropagationWhenEditing?: boolean;
}

export interface BuilderComponentState {
  state: any;
  update: (state: any) => any;
  updates: number;
  context: any;
  key: number;
}

const tryEval = (str?: string, data: any = {}, errors?: Error[]): any => {
  const value = str;
  if (!(typeof value === 'string' && value.trim())) {
    return;
  }
  const useReturn = !(value.includes(';') || value.includes(' return '));
  let fn: Function = () => {
    /* Intentionally empty */
  };
  try {
    if (Builder.isBrowser) {
      // tslint:disable-next-line:no-function-constructor-with-string-args
      // TODO: VM in node......
      fn = new Function(
        'state',
        // TODO: remove the with () {} - make a page v3 that doesn't use this
        `var rootState = state;
        if (typeof Proxy !== 'undefined') {
          rootState = new Proxy(rootState, {
            set: function () {
              return false;
            },
            get: function (target, key) {
              if (key === 'state') {
                return state;
              }
              return target[key]
            }
          });
        }
        with (rootState) {
          ${useReturn ? `return (${str});` : str};
        }`
      );
    }
  } catch (error) {
    if (Builder.isBrowser) {
      console.warn('Could not compile javascript', error);
    } else {
      // Add to req.options.errors to return to client
    }
  }
  try {
    if (Builder.isBrowser) {
      return fn(data || {});
    } else {
      // Below is a hack to get certain code to *only* load in the server build, to not screw with
      // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
      // for the server build
      // tslint:disable:comment-format
      const { VM } = safeDynamicRequire('vm2');
      return new VM({
        sandbox: {
          ...data,
          ...{ state: data },
        },
        // TODO: convert reutrn to module.exports on server
      }).run(value.replace(/(^|;)return /, '$1'));
      // tslint:enable:comment-format
    }
  } catch (error) {
    if (errors) {
      errors.push(error);
    }

    if (Builder.isBrowser) {
      console.warn('Builder custom code error:', error.message, 'in', str, error.stack);
    } else {
      if (process.env.DEBUG) {
        console.debug('Builder custom code error:', error.message, 'in', str, error.stack);
      }
      // Add to req.options.errors to return to client
    }
  }

  return;
};

function searchToObject(location: Location | Url) {
  const pairs = (location.search || '').substring(1).split('&');
  const obj: { [key: string]: string } = {};

  for (const i in pairs) {
    if (!(pairs[i] && typeof pairs[i] === 'string')) {
      continue;
    }
    const pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
}

/**
 * Responsible for rendering Builder content of type: 'page' or 'section' to
 * react components. It will attempt to fetch content from the API based on
 * defined user attributes (URL path, device type, and any custom targeting you set using `builder.setUserAttributes`) unless a `BuilderContent`
 * object is provided to `props.content`
 *
 * Use it to mount content in desired location, enable editing in place when
 * previewed in the editor.
 *
 * Supports server-side-rendering when passed the content json as
 * `props.content`.
 */
export class BuilderComponent extends React.Component<
  BuilderComponentProps,
  BuilderComponentState
> {
  static defaults: Pick<BuilderComponentProps, 'codegen'> = {
    codegen: Boolean(Builder.isBrowser && location.href.includes('builder.codegen=true')),
  };

  subscriptions: Subscription = new Subscription();
  // TODO: don't trigger initial one?
  onStateChange = new BehaviorSubject<any>(null);
  asServer = Builder.isServer;

  contentRef: BuilderContent | null = null;

  styleRef: HTMLStyleElement | null = null;

  rootState = Builder.isServer ? {} : onChange({}, () => this.updateState());

  lastJsCode = '';
  lastHttpRequests: { [key: string]: string | undefined } = {};
  httpSubscriptionPerKey: { [key: string]: Subscription | undefined } = {};

  ref: HTMLElement | null = null;

  Component: any;

  get options() {
    // TODO: for perf cache this
    return {
      ...BuilderComponent.defaults,
      ...this.props,
    };
  }

  get name(): string | undefined {
    return this.props.model || this.props.modelName || this.props.name; // || this.props.model
  }

  private _asyncRequests?: RequestOrPromise[];
  private _errors?: Error[];
  private _logs?: string[];

  get element() {
    return this.ref;
  }

  get inlinedContent() {
    if (this.isPreviewing && !this.props.inlineContent) {
      return undefined;
    }
    return this.props.content;
  }

  constructor(props: BuilderComponentProps) {
    super(props);

    // TODO: pass this all the way down - symbols, etc
    // this.asServer = Boolean(props.hydrate && Builder.isBrowser)

    this.state = {
      // TODO: should change if this prop changes
      context: {
        ...props.context,
        apiKey: builder.apiKey || this.props.apiKey,
      },
      state: Object.assign(this.rootState, {
        ...(this.inlinedContent && this.inlinedContent.data && this.inlinedContent.data.state),
        isBrowser: Builder.isBrowser, // !this.asServer,
        isServer: !Builder.isBrowser, // this.asServer,
        _hydrate: props.hydrate,
        location: this.locationState,
        deviceSize: this.deviceSizeState,
        // TODO: will user attributes be ready here?
        device: this.device,
        ...this.getHtmlData(),
        ...props.data,
      }),
      updates: 0,
      key: 0,
      update: this.updateState,
    };

    if (Builder.isBrowser) {
      const key = this.props.apiKey;
      if (key && key !== this.builder.apiKey) {
        this.builder.apiKey = key;
      }

      if (this.inlinedContent) {
        // Sometimes with graphql we get the content as `content.content`
        const content = (this.inlinedContent as any).content || this.inlinedContent;
        this.onContentLoaded(content?.data, getContentWithInfo(content)!);
      }
    }
  }

  get builder() {
    return this.props.builder || builder;
  }

  getHtmlData() {
    const id = (this.inlinedContent && this.inlinedContent.id) || this.props.entry;
    const script =
      id &&
      Builder.isBrowser &&
      document.querySelector(
        `script[data-builder-json="${id}"],script[data-builder-state="${id}"]`
      );
    if (script) {
      try {
        const json = JSON.parse((script as HTMLElement).innerText);
        return json;
      } catch (err) {
        console.warn(
          'Could not parse Builder.io HTML data transfer',
          err,
          (script as HTMLElement).innerText
        );
      }
    }
    return {};
  }

  // TODO: pass down with context
  get device() {
    return this.builder.getUserAttributes().device || 'desktop';
  }

  get locationState() {
    return {
      // TODO: handle this correctly on the server. Pass in with CONTEXT
      ...pick(this.location, 'pathname', 'hostname', 'search', 'host'),
      path: (this.location.pathname && this.location.pathname.split('/').slice(1)) || '',
      query: searchToObject(this.location),
    };
  }

  // TODO: trigger state change on screen size change
  get deviceSizeState() {
    // TODO: use context to pass this down on server
    return Builder.isBrowser
      ? sizes.getSizeForWidth(window.innerWidth)
      : sizeMap[this.device] || 'large';
  }

  messageListener = (event: MessageEvent) => {
    const info = event.data;
    switch (info.type) {
      case 'builder.updateSpacer': {
        const data = info.data;
        const currentSpacer = this.rootState._spacer;
        this.updateState(state => {
          state._spacer = data;
        });
        break;
      }
      case 'builder.resetState': {
        const { state, model } = info.data;
        if (model === this.name) {
          for (const key in this.rootState) {
            // TODO: support nested functions (somehow)
            if (typeof this.rootState[key] !== 'function') {
              delete this.rootState[key];
            }
          }
          Object.assign(this.rootState, state);
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: ((this.state && this.state.updates) || 0) + 1,
          });
        }
        break;
      }
      case 'builder.resetSymbolState': {
        const { state, model, id } = info.data.state;
        if (this.props.builderBlock && this.props.builderBlock === id) {
          for (const key in this.rootState) {
            delete this.rootState[key];
          }
          Object.assign(this.rootState, state);
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: ((this.state && this.state.updates) || 0) + 1,
          });
        }
        break;
      }
    }
  };

  resizeFn = () => {
    const deviceSize = this.deviceSizeState;
    if (deviceSize !== this.state.state.deviceSize) {
      this.setState({
        ...this.state,
        updates: ((this.state && this.state.updates) || 0) + 1,
        state: Object.assign(this.rootState, {
          ...this.state.state,
          deviceSize,
        }),
      });
    }
  };

  resizeListener = Builder.isEditing ? throttle(this.resizeFn, 200) : debounce(this.resizeFn, 400);

  static renderInto(
    elementOrSelector: string | HTMLElement,
    props: BuilderComponentProps = {},
    hydrate = true,
    fresh = false
  ) {
    console.debug('BuilderPage.renderInto', elementOrSelector, props, hydrate, this);

    if (!elementOrSelector) {
      return;
    }

    let element: Element | null = null;

    if (typeof elementOrSelector === 'string') {
      element = document.querySelector(elementOrSelector);
    } else {
      if (elementOrSelector instanceof Element) {
        element = elementOrSelector;
      }
    }

    if (!element) {
      return;
    }

    const exists = element.classList.contains('builder-hydrated');
    if (exists && !fresh) {
      console.debug('Tried to hydrate multiple times');
      return;
    }
    element.classList.add('builder-hydrated');

    let shouldHydrate = hydrate && element.innerHTML.includes('builder-block');

    if (!element.classList.contains('builder-component')) {
      // TODO: maybe remove any builder-api-styles...
      const apiStyles =
        element.querySelector('.builder-api-styles') ||
        (element.previousElementSibling &&
        element.previousElementSibling.matches('.builder-api-styles')
          ? element.previousElementSibling
          : null);
      let keepStyles = '';
      if (apiStyles) {
        const html = apiStyles.innerHTML;
        html.replace(
          /\/\*start:([^\*]+?)\*\/([\s\S]*?)\/\*end:([^\*]+?)\*\//g,
          (match, id, content) => {
            let el: HTMLElement | null = null;
            try {
              el = document.querySelector(`[data-emotion-css="${id}"]`);
            } catch (err) {
              console.warn(err);
            }
            if (el) {
              el.innerHTML = content;
            } else if (!Builder.isEditing) {
              keepStyles += match;
            }

            return match;
          }
        );
        // NextTick? or longer timeout?
        Builder.nextTick(() => {
          apiStyles.innerHTML = keepStyles;
        });
      }
      const useElement = element.querySelector('.builder-component');
      if (useElement) {
        element = useElement;
      } else {
        shouldHydrate = false;
      }
    }

    if (location.search.includes('builder.debug=true')) {
      console.debug('hydrate', shouldHydrate, element);
    }

    let useEl = element;
    if (!exists) {
      const div = document.createElement('div');
      element.insertAdjacentElement('beforebegin', div);
      div.appendChild(element);
      useEl = div;
    }

    if (Builder.isEditing || (Builder.isBrowser && location.search.includes('builder.preview='))) {
      shouldHydrate = false;
    }
    if (shouldHydrate && element) {
      // TODO: maybe hydrate again. Maybe...
      const val = ReactDOM.render(
        <BuilderComponent {...props} />,
        useEl,
        (useEl as any).builderRootRef
      );
      (useEl as any).builderRootRef = val;
      return val;
    }
    const val = ReactDOM.render(
      <BuilderComponent {...props} />,
      useEl,
      (useEl as any).builderRootRef
    );
    (useEl as any).builderRootRef = val;
    return val;
  }

  mounted = false;

  componentDidMount() {
    this.mounted = true;
    if (this.asServer) {
      this.asServer = false;
      this.updateState(state => {
        state.isBrowser = true;
        state.isServer = false;
      });
    }

    if (Builder.isIframe) {
      window.parent?.postMessage(
        { type: 'builder.sdkInjected', data: { modelName: this.name } },
        '*'
      );
    }

    if (Builder.isBrowser) {
      // TODO: remove event on unload
      window.addEventListener('resize', this.resizeListener);
      if (Builder.isEditing) {
        window.addEventListener('message', this.messageListener);
      }

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('builder:component:load', {
            detail: {
              ref: this,
            },
          })
        );
      });
    }
  }

  updateState = (fn?: (state: any) => void) => {
    const state = this.rootState;
    if (fn) {
      fn(state);
    }
    if (this.mounted) {
      this.setState({
        update: this.updateState,
        state,
        updates: ((this.state && this.state.updates) || 0) + 1,
      });
    } else {
      this.state = {
        ...this.state,
        update: this.updateState,
        state,
        updates: ((this.state && this.state.updates) || 0) + 1,
      };
    }

    this.notifyStateChange();
  };

  get isPreviewing() {
    return (
      (Builder.isServer || (Builder.isBrowser && Builder.isPreviewing)) &&
      builder.previewingModel === this.name
    );
  }

  @debounceNextTick
  notifyStateChange() {
    if (Builder.isServer) {
      return;
    }
    if (!(this && this.state)) {
      return;
    }
    const nextState = this.state.state;
    // TODO: only run the below once per tick...
    if (this.props.onStateChange) {
      this.props.onStateChange(nextState);
    }

    if (Builder.isBrowser) {
      window.dispatchEvent(
        new CustomEvent('builder:component:stateChange', {
          detail: {
            state: nextState,
            ref: this,
          },
        })
      );
    }
    this.onStateChange.next(nextState);
  }

  processStateFromApi(state: { [key: string]: any }) {
    return state; //  mapValues(state, value => tryEval(value, this.data, this._errors))
  }

  get location() {
    return this.props.location || (Builder.isBrowser ? location : ({} as any));
  }

  getCssFromFont(font: any, data?: any) {
    // TODO: compute what font sizes are used and only load those.......
    const family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '');
    const name = family.split(',')[0];
    const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
    let str = '';
    if (url && family && name) {
      str += `
@font-face {
  font-family: "${family}";
  src: local("${name}"), url('${url}') format('woff2');
  font-display: fallback;
  font-weight: 400;
}
        `.trim();
    }

    if (font.files) {
      for (const weight in font.files) {
        const isNumber = String(Number(weight)) === weight;
        if (!isNumber) {
          continue;
        }
        // TODO: maybe limit number loaded
        const weightUrl = font.files[weight];
        if (weightUrl && weightUrl !== url) {
          str += `
@font-face {
  font-family: "${family}";
  src: url('${weightUrl}') format('woff2');
  font-display: fallback;
  font-weight: ${weight};
}
          `.trim();
        }
      }
    }
    return str;
  }

  componentWillUnmount() {
    this.unsubscribe();
    if (Builder.isBrowser) {
      window.removeEventListener('resize', this.resizeListener);
      window.removeEventListener('message', this.messageListener);
    }
  }

  getFontCss(data?: any) {
    if (!this.builder.allowCustomFonts) {
      return '';
    }
    // TODO: separate internal data from external
    return (
      (data?.customFonts &&
        data.customFonts.length &&
        data.customFonts.map((font: any) => this.getCssFromFont(font, data)).join(' ')) ||
      ''
    );
  }

  ensureFontsLoaded(data?: any) {
    if (this.builder.allowCustomFonts && data?.customFonts && Array.isArray(data.customFonts)) {
      for (const font of data.customFonts) {
        const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular;
        if (!fontsLoaded.has(url)) {
          const html = this.getCssFromFont(font, data);
          fontsLoaded.add(url);
          if (!html) {
            continue;
          }
          const style = document.createElement('style');
          style.className = 'builder-custom-font';
          style.setAttribute('data-builder-custom-font', url);
          style.innerHTML = html;
          document.head.appendChild(style);
        }
      }
    }
  }

  getCss(data?: any) {
    const contentId = this.useContent?.id;
    let cssCode = data?.cssCode || '';
    if (contentId) {
      // Allow using `&` in custom CSS code like @emotion
      // E.g. `& .foobar { ... }` to scope CSS
      // TODO: handle if '&' is within a string like `content: "&"`
      cssCode = cssCode.replace(/&/g, `.builder-component-${contentId}`);
    }

    return cssCode + this.getFontCss(data);
  }

  get data() {
    const data = {
      ...(this.inlinedContent && this.inlinedContent.data?.state),
      ...this.props.data,
      ...this.state.state,
    };
    Object.assign(this.rootState, data);
    return data;
  }

  componentDidUpdate(prevProps: BuilderComponentProps) {
    // TODO: shallow diff
    if (this.props.data && prevProps.data !== this.props.data) {
      this.state.update((state: any) => {
        Object.assign(state, this.props.data);
      });
    }

    if (Builder.isEditing) {
      if (this.inlinedContent && prevProps.content !== this.inlinedContent) {
        this.onContentLoaded(this.inlinedContent.data, this.inlinedContent);
      }
    }
  }

  // FIXME: workaround to issue with CSS extraction and then hydration
  // (might be preact only)
  checkStyles(data: any) {
    if (this.styleRef) {
      const css = this.getCss(data);
      if (this.styleRef.innerHTML !== css) {
        this.styleRef.innerHTML = css;
      }
    }
  }

  reload() {
    this.setState({
      key: this.state.key + 1,
    });
  }

  get content() {
    let content = this.inlinedContent;
    if (content && (content as any).content) {
      // GraphQL workaround
      content = {
        ...content,
        data: (content as any).content,
      };
    }
    return content;
  }

  get useContent() {
    return this.content || this.state.context.builderContent;
  }

  render() {
    const content = this.content;

    const dataString =
      Builder.isBrowser && this.props.data && size(this.props.data) && hash(this.props.data);
    let key = Builder.isEditing ? this.name : this.props.entry;
    if (key && !Builder.isEditing && dataString && dataString.length < 300) {
      key += ':' + dataString;
    }

    const WrapComponent = this.props.dataOnly ? React.Fragment : 'div';

    const contentId = this.useContent?.id;

    return (
      // TODO: data attributes for model, id, etc?
      <WrapComponent
        onClick={event => {
          // Prevent propagation from the root content component when editing to prevent issues
          // like client side routing triggering when links are clicked, unless this behavior is
          // disabled with the stopClickPropagationWhenEditing prop
          if (
            Builder.isEditing &&
            !this.props.isChild &&
            !this.props.stopClickPropagationWhenEditing
          ) {
            event.stopPropagation();
          }
        }}
        className={`builder-component ${contentId ? `builder-component-${contentId}` : ''}`}
        data-name={this.name}
        data-source="Rendered by Builder.io"
        key={this.state.key}
        ref={ref => (this.ref = ref)}
      >
        <BuilderMetaContext.Consumer>
          {value => (
            <BuilderMetaContext.Provider
              value={
                typeof this.props.ampMode === 'boolean'
                  ? {
                      ...value,
                      ampMode: this.props.ampMode,
                    }
                  : value
              }
            >
              <BuilderAsyncRequestsContext.Consumer>
                {value => {
                  this._asyncRequests = value && value.requests;
                  this._errors = value && value.errors;
                  this._logs = value && value.logs;

                  return (
                    <BuilderContent
                      isStatic={this.props.isStatic || Builder.isStatic}
                      key={
                        this.inlinedContent?.id ||
                        ('content' in this.props && !this.isPreviewing
                          ? 'null-content-prop'
                          : 'no-content-prop')
                      }
                      builder={this.builder}
                      ref={ref => (this.contentRef = ref)}
                      // TODO: pass entry in
                      contentLoaded={(data, content) => this.onContentLoaded(data, content)}
                      options={{
                        key,
                        entry: this.props.entry,
                        ...(content && { initialContent: [content] }),
                        ...(!content &&
                          'content' in this.props &&
                          !this.isPreviewing && { initialContent: [] }),
                        ...(this.props.url && { url: this.props.url }),
                        ...this.props.options,
                        ...(this.options.codegen && {
                          format: 'react',
                        }),
                      }}
                      inline={
                        this.props.inlineContent || (!this.isPreviewing && 'content' in this.props)
                      }
                      contentError={this.props.contentError}
                      modelName={this.name || 'page'}
                    >
                      {(data, loading, fullData) => {
                        if (this.props.dataOnly) {
                          return null;
                        }

                        if (fullData && fullData.id) {
                          this.state.context.builderContent = fullData;
                        }
                        if (Builder.isBrowser) {
                          Builder.nextTick(() => {
                            this.checkStyles(data);
                          });
                        }

                        const { codegen } = this.options;

                        if (codegen && !this.Component && data?.blocksJs) {
                          const builderComponentNames: string[] = Array.from(
                            new Set(Builder.components.map((item: any) => item.name))
                          );
                          const reversedcomponents = Builder.components.slice().reverse();

                          const builderComponents = builderComponentNames.map(name =>
                            reversedcomponents.find((item: any) => item.class && item.name === name)
                          );

                          const useBuilderState = (initialState: any) => {
                            const [, setTick] = React.useState(0);
                            const [state] = React.useState(() =>
                              onChange(initialState, function () {
                                setTick(tick => tick + 1);
                              })
                            );

                            return state;
                          };

                          const mappedComponentNames = builderComponentNames.map(name =>
                            (name || '').replace(/[^\w]+/gi, '')
                          );

                          const finalizedComponents = builderComponents.map(info =>
                            wrapComponent(info)
                          );

                          this.Component = new Function(
                            'jsx',
                            '_css',
                            'Builder',
                            'builder',
                            'React',
                            'useBuilderState',
                            ...mappedComponentNames,
                            data.blocksJs
                          )(
                            jsx,
                            css,
                            Builder,
                            builder,
                            React,
                            useBuilderState,
                            ...finalizedComponents
                          );
                        }

                        // TODO: loading option - maybe that is what the children is or component prop
                        // TODO: get rid of all these wrapper divs
                        return data ? (
                          <div
                            data-builder-component={this.name}
                            data-builder-content-id={fullData.id}
                            data-builder-variation-id={
                              fullData.testVariationId || fullData.variationId || fullData.id
                            }
                          >
                            {!codegen && this.getCss(data) && (
                              <style
                                ref={ref => (this.styleRef = ref)}
                                className="builder-custom-styles"
                                dangerouslySetInnerHTML={{
                                  __html: this.getCss(data),
                                }}
                              />
                            )}
                            <BuilderStoreContext.Provider
                              value={{
                                ...this.state,
                                rootState: this.rootState,
                                state: this.data,
                                content: fullData,
                                renderLink: this.props.renderLink,
                              }}
                            >
                              {codegen && this.Component ? (
                                <this.Component data={this.data} context={this.state.context} />
                              ) : (
                                <BuilderBlocks
                                  key={String(!!data?.blocks?.length)}
                                  emailMode={this.props.emailMode}
                                  fieldName="blocks"
                                  blocks={data.blocks}
                                />
                              )}
                            </BuilderStoreContext.Provider>
                          </div>
                        ) : loading ? (
                          <div data-builder-component={this.name} className="builder-loading">
                            {this.props.children}
                          </div>
                        ) : (
                          <div data-builder-component={this.name} className="builder-no-content" />
                        );
                      }}
                    </BuilderContent>
                  );
                }}
              </BuilderAsyncRequestsContext.Consumer>
            </BuilderMetaContext.Provider>
          )}
        </BuilderMetaContext.Consumer>
      </WrapComponent>
    );
  }

  evalExpression(expression: string) {
    const { data } = this;
    return expression.replace(/{{([^}]+)}}/g, (match, group) => tryEval(group, data, this._errors));
  }

  async handleRequest(propertyName: string, url: string) {
    // TODO: Builder.isEditing = just checks if iframe and parent page is this.builder.io or localhost:1234
    if (Builder.isIframe && fetchCache[url]) {
      this.updateState(ctx => {
        ctx[propertyName] = fetchCache[url];
      });
      return fetchCache[url];
    }
    const request = async () => {
      const requestStart = Date.now();
      if (!Builder.isBrowser) {
        console.time('Fetch ' + url);
      }
      let json: any;
      try {
        const result = await fetch(url);
        json = await result.json();
      } catch (err) {
        if (this._errors) {
          this._errors.push(err);
        }
        if (this._logs) {
          this._logs.push(`Fetch to ${url} errored in ${Date.now() - requestStart}ms`);
        }
        return;
      } finally {
        if (!Builder.isBrowser) {
          console.timeEnd('Fetch ' + url);
          if (this._logs) {
            this._logs.push(`Fetched ${url} in ${Date.now() - requestStart}ms`);
          }
        }
      }

      if (json) {
        if (Builder.isIframe) {
          fetchCache[url] = json;
        }
        // TODO: debounce next tick all of these when there are a bunch
        this.updateState(ctx => {
          ctx[propertyName] = json;
        });
      }

      return json;
    };
    const existing =
      this._asyncRequests &&
      (this._asyncRequests.find(
        req => isRequestInfo(req) && req.url === url
      ) as RequestInfo | null);
    if (existing) {
      const promise = existing.promise;
      promise.then(json => {
        if (json) {
          this.updateState(ctx => {
            ctx[propertyName] = json;
          });
        }
      });
      return promise;
    }
    const promise = request();
    Builder.nextTick(() => {
      if (this._asyncRequests) {
        this._asyncRequests.push(promise);
      }
    });
    return promise;
  }

  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
      this.subscriptions = new Subscription();
    }
  }

  handleBuilderRequest(propertyName: string, optionsString: string) {
    const options = tryEval(optionsString, this.data, this._errors);
    // TODO: this will screw up for multiple bits of data
    if (this.subscriptions) {
      this.unsubscribe();
    }
    // TODO: don't unsubscribe and resubscribe every time data changes, will make a TON of requests if that's the case when editing...
    // I guess will be cached then
    if (options) {
      // TODO: unsubscribe on destroy
      this.subscriptions.add(
        this.builder.queueGetContent(options.model, options).subscribe(matches => {
          if (matches) {
            this.updateState(ctx => {
              ctx[propertyName] = matches;
            });
          }
        })
      );
    }
  }

  onContentLoaded = (data: any, content: Content) => {
    if (this.name === 'page' && Builder.isBrowser) {
      if (data) {
        const { title, pageTitle, description, pageDescription } = data;

        if (title || pageTitle) {
          document.title = title || pageTitle;
        }

        if (description || pageDescription) {
          let descriptionTag = document.querySelector('meta[name="description"]');

          if (!descriptionTag) {
            descriptionTag = document.createElement('meta');
            descriptionTag.setAttribute('name', 'description');
            document.head.appendChild(descriptionTag);
          }

          descriptionTag.setAttribute('content', description || pageDescription);
        }
      }
    }

    if (Builder.isEditing) {
      this.notifyStateChange();
    }

    // Unsubscribe all? TODO: maybe don't continuous fire when editing.....
    if (this.props.contentLoaded) {
      this.props.contentLoaded(data, content);
    }

    if (data && data.inputs && Array.isArray(data.inputs) && data.inputs.length) {
      if (!data.state) {
        data.state = {};
      }

      // Maybe...
      // if (data.context) {
      //   Object.assign(this.state.context, data.context)
      // }
      // TODO: may not want this... or make sure anything overriden
      // explitily sets to null
      data.inputs.forEach((input: any) => {
        if (input) {
          if (
            input.name &&
            input.defaultValue !== undefined &&
            data.state[input.name] === undefined
          ) {
            data.state[input.name] = input.defaultValue;
          }
        }
      });
    }

    if (data && data.state) {
      const newState = {
        ...this.state,
        updates: ((this.state && this.state.updates) || 0) + 1,
        state: Object.assign(this.rootState, {
          ...this.state.state,
          location: this.locationState,
          deviceSize: this.deviceSizeState,
          device: this.device,
          ...data.state,
          ...this.props.data,
        }),
      };
      if (this.mounted) {
        this.setState(newState);
      } else {
        this.state = newState;
      }
    }

    // TODO: also throttle on edits maybe
    if (data && data.jsCode && Builder.isBrowser && !this.options.codegen) {
      // Don't rerun js code when editing and not changed
      let skip = false;
      if (Builder.isEditing) {
        if (this.lastJsCode === data.jsCode) {
          skip = true;
        } else {
          this.lastJsCode = data.jsCode;
        }
      }

      if (!skip) {
        const state = this.state.state;

        // TODO: real editing method
        try {
          const result = new Function(
            'data',
            'ref',
            'state',
            'update',
            'element',
            'Builder',
            'builder',
            'context',
            data.jsCode
          )(data, this, state, this.state.update, this.ref, Builder, builder, this.state.context);

          // TODO: allow exports = { } syntax?
          // TODO: do something with reuslt like view - methods, computed, actions, properties, template, etc etc
        } catch (error) {
          if (Builder.isBrowser) {
            console.warn(
              'Builder custom code error:',
              error.message,
              'in',
              data.jsCode,
              error.stack
            );
          } else {
            if (process.env.DEBUG) {
              console.debug(
                'Builder custom code error:',
                error.message,
                'in',
                data.jsCode,
                error.stack
              );
            }
            // Add to req.options.errors to return to client
          }
        }
      }
    }

    if (data && data.httpRequests /* || data.builderData @DEPRECATED */ && !this.props.noAsync) {
      // Don't rerun http requests when editing and not changed
      // No longer needed?
      let skip = false;

      if (!skip) {
        // TODO: another structure for this
        for (const key in data.httpRequests) {
          const url: string | undefined = data.httpRequests[key];
          if (url && (!this.data[key] || Builder.isEditing)) {
            // TODO: if Builder.isEditing and url patches https://builder.io/api/v2/content/{editingModel}
            // Then use this.builder.get().subscribe(...)
            if (Builder.isBrowser) {
              const finalUrl = this.evalExpression(url);
              if (Builder.isEditing && this.lastHttpRequests[key] === finalUrl) {
                continue;
              }
              this.lastHttpRequests[key] = finalUrl;
              const builderModelRe = /builder\.io\/api\/v2\/([^\/\?]+)/i;
              const builderModelMatch = url.match(builderModelRe);
              const model = builderModelMatch && builderModelMatch[1];
              if (false && Builder.isEditing && model && this.builder.editingModel === model) {
                this.handleRequest(key, finalUrl);
                // TODO: fix this
                // this.subscriptions.add(
                //   this.builder.get(model).subscribe(data => {
                //     this.state.update((state: any) => {
                //       state[key] = data
                //     })
                //   })
                // )
              } else {
                this.handleRequest(key, finalUrl);
                const currentSubscription = this.httpSubscriptionPerKey[key];
                if (currentSubscription) {
                  currentSubscription.unsubscribe();
                }

                // TODO: fix this
                const newSubscription = (this.httpSubscriptionPerKey[key] =
                  this.onStateChange.subscribe(() => {
                    const newUrl = this.evalExpression(url);
                    if (newUrl !== finalUrl) {
                      this.handleRequest(key, newUrl);
                      this.lastHttpRequests[key] = newUrl;
                    }
                  }));
                this.subscriptions.add(newSubscription);
              }
            } else {
              this.handleRequest(key, this.evalExpression(url));
            }
          }
        }

        // @DEPRECATED
        // for (const key in data.builderData) {
        //   const url = data.builderData[key]
        //   if (url && !this.data[key]) {
        //     this.handleBuilderRequest(key, this.evalExpression(url))
        //   }
        // }
      }
    }
  };
}
