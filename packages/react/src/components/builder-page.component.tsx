import React from 'react'
import ReactDOM from 'react-dom'
import { BuilderContent } from './builder-content.component'
import { BuilderBlocks } from './builder-blocks.component'
import {
  Builder,
  GetContentOptions,
  builder,
  Subscription,
  BehaviorSubject,
  BuilderElement
} from '@builder.io/sdk'
import { BuilderStoreContext } from '../store/builder-store'
import hash from 'hash-sum'
import onChange from 'lib/on-change.js'

export { onChange }

import { sizes } from '../constants/device-sizes.constant'
import {
  BuilderAsyncRequestsContext,
  RequestOrPromise,
  RequestInfo,
  isRequestInfo
} from '../store/builder-async-requests'
import { Url } from 'url'
import { debounceNextTick } from '../functions/debonce-next-tick'
import { throttle } from '../functions/throttle'
import { safeDynamicRequire } from '../functions/safe-dynamic-require'
import { BuilderMetaContext } from '../store/builder-meta'

const size = (thing: object) => Object.keys(thing).length

function debounce(func: Function, wait: number, immediate = false) {
  let timeout: any
  return function(this: any) {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }, wait)
    if (immediate && !timeout) func.apply(context, args)
  }
}

const fontsLoaded = new Set()

function pick(object: any, keys: string[]) {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key]
    }
    return obj
  }, {} as any)
}

// TODO: get fetch from core JS....
const fetch = Builder.isBrowser ? window.fetch : require('node-fetch')

const sizeMap = {
  desktop: 'large',
  tablet: 'medium',
  mobile: 'small'
}

function decorator(fn: Function) {
  return function argReceiver(...fnArgs: any[]) {
    // Check if the decorator is being called without arguments (ex `@foo methodName() {}`)
    if (fnArgs.length === 3) {
      const [target, key, descriptor] = fnArgs
      if (descriptor && (descriptor.value || descriptor.get)) {
        fnArgs = []
        return descriptorChecker(target, key, descriptor)
      }
    }

    return descriptorChecker

    // descriptorChecker determines whether a method or getter is being decorated
    // and replaces the appropriate key with the decorated function.
    function descriptorChecker(target: any, key: any, descriptor: any) {
      const descriptorKey = descriptor.value ? 'value' : 'get'
      return {
        ...descriptor,
        [descriptorKey]: fn(descriptor[descriptorKey], ...fnArgs)
      }
    }
  }
}

const Throttle = decorator(throttle)

const fetchCache: { [key: string]: any } = {}

export interface BuilderPageProps {
  modelName?: string
  model?: string
  name?: string
  data?: any
  builder?: Builder
  entry?: string
  apiKey?: string
  options?: GetContentOptions
  contentLoaded?: (data: any) => void
  renderLink?: (props: React.AnchorHTMLAttributes<any>) => React.ReactNode
  contentError?: (error: any) => void
  content?: any
  location?: Location | Url
  onStateChange?: (newData: any) => void
  noAsync?: boolean
  emailMode?: boolean
  ampMode?: boolean
  inlineContent?: boolean
  builderBlock?: BuilderElement
  dataOnly?: boolean
  hydrate?: boolean
  context?: any
}

export interface BuilderPageState {
  state: any
  update: (state: any) => any
  updates: number
  context: any
  key: number
}

const tryEval = (str?: string, data: any = {}, errors?: Error[]): any => {
  const value = str
  if (!(typeof value === 'string' && value.trim())) {
    return
  }
  const useReturn = !(value.includes(';') || value.includes(' return '))
  let fn: Function = () => {
    /* Intentionally empty */
  }
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
      )
    }
  } catch (error) {
    if (Builder.isBrowser) {
      console.warn('Could not compile javascript', error)
    } else {
      // Add to req.options.errors to return to client
    }
  }
  try {
    if (Builder.isBrowser) {
      return fn(data || {})
    } else {
      // Below is a hack to get certain code to *only* load in the server build, to not screw with
      // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
      // for the server build
      // tslint:disable:comment-format
      const { VM } = safeDynamicRequire('vm2')
      return new VM({
        sandbox: {
          ...data,
          ...{ state: data }
        }
        // TODO: convert reutrn to module.exports on server
      }).run(value.replace(/(^|;)return /, '$1'))
      // tslint:enable:comment-format
    }
  } catch (error) {
    if (errors) {
      errors.push(error)
    }

    if (Builder.isBrowser) {
      console.warn(
        'Builder custom code error:',
        error.message,
        'in',
        str,
        error.stack
      )
    } else {
      if (process.env.DEBUG) {
        console.debug(
          'Builder custom code error:',
          error.message,
          'in',
          str,
          error.stack
        )
      }
      // Add to req.options.errors to return to client
    }
  }

  return
}

function searchToObject(location: Location | Url) {
  const pairs = (location.search || '').substring(1).split('&')
  const obj: { [key: string]: string } = {}

  for (const i in pairs) {
    if (pairs[i] === '') continue
    const pair = pairs[i].split('=')
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
  }

  return obj
}

export class BuilderPage extends React.Component<
  BuilderPageProps,
  BuilderPageState
> {
  subscriptions: Subscription = new Subscription()
  // TODO: don't trigger initial one?
  onStateChange = new BehaviorSubject<any>(null)
  asServer = false

  contentRef: BuilderContent | null = null

  styleRef: HTMLStyleElement | null = null

  rootState = onChange({}, () => this.updateState())

  lastJsCode = ''
  lastHttpRequests: { [key: string]: string | undefined } = {}
  httpSubscriptionPerKey: { [key: string]: Subscription | undefined } = {}

  ref: HTMLElement | null = null

  get name(): string | undefined {
    return this.props.model || this.props.modelName || this.props.name // || this.props.model
  }

  private _asyncRequests?: RequestOrPromise[]
  private _errors?: Error[]
  private _logs?: string[]

  get element() {
    return this.ref
  }

  constructor(props: BuilderPageProps) {
    super(props)

    // TODO: pass this all the way down - symbols, etc
    // this.asServer = Boolean(props.hydrate && Builder.isBrowser)

    this.state = {
      // TODO: should change if this prop changes
      context: props.context || {},
      state: Object.assign(this.rootState, {
        ...(this.props.content &&
          this.props.content.data &&
          this.props.content.data.state),
        isBrowser: Builder.isBrowser, // !this.asServer,
        isServer: !Builder.isBrowser, // this.asServer,
        _hydrate: props.hydrate,
        location: this.locationState,
        deviceSize: this.deviceSizeState,
        // TODO: will user attributes be ready here?
        device: this.device,
        ...this.getHtmlData(),
        ...props.data
      }),
      updates: 0,
      key: 0,
      update: this.updateState
    }

    if (Builder.isBrowser) {
      const key = this.props.apiKey
      if (key && key !== this.builder.apiKey) {
        this.builder.apiKey = key
      }

      if (this.props.content) {
        // TODO: this should be on didMount right bc of element ref??
        // TODO: possibly observe for change or throw error if changes
        this.onContentLoaded(
          this.props.content.content ||
            this.props.content.data /*, this.props.content*/
        )
      }
    }
  }

  get builder() {
    return this.props.builder || builder
  }

  getHtmlData() {
    const id = (this.props.content && this.props.content.id) || this.props.entry
    const script =
      id &&
      Builder.isBrowser &&
      document.querySelector(
        `script[data-builder-json="${id}"],script[data-builder-state="${id}"]`
      )
    if (script) {
      try {
        const json = JSON.parse((script as HTMLElement).innerText)
        return json
      } catch (err) {
        console.warn(
          'Could not parse Builder.io HTML data transfer',
          err,
          (script as HTMLElement).innerText
        )
      }
    }
    return {}
  }

  // TODO: pass down with context
  get device() {
    return this.builder.getUserAttributes().device || 'desktop'
  }

  get locationState() {
    return {
      // TODO: handle this correctly on the server. Pass in with CONTEXT
      ...pick(this.location, ['pathname', 'hostname', 'search', 'host']),
      path:
        (this.location.pathname &&
          this.location.pathname.split('/').slice(1)) ||
        '',
      query: searchToObject(this.location)
    }
  }

  // TODO: trigger state change on screen size change
  get deviceSizeState() {
    // TODO: use context to pass this down on server
    return Builder.isBrowser
      ? sizes.getSizeForWidth(window.innerWidth)
      : sizeMap[this.device] || 'large'
  }

  messageListener = (event: MessageEvent) => {
    const info = event.data
    switch (info.type) {
      case 'builder.updateSpacer': {
        const data = info.data
        const currentSpacer = this.rootState._spacer
        this.updateState(state => {
          state._spacer = data
        })
        break
      }
      case 'builder.resetState': {
        const { state, model } = info.data
        if (model === this.name) {
          for (const key in this.rootState) {
            // TODO: support nested functions (somehow)
            if (typeof this.rootState[key] !== 'function') {
              delete this.rootState[key]
            }
          }
          Object.assign(this.rootState, state)
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: ((this.state && this.state.updates) || 0) + 1
          })
        }
        break
      }
      case 'builder.resetSymbolState': {
        const { state, model, id } = info.data.state
        if (this.props.builderBlock && this.props.builderBlock === id) {
          for (const key in this.rootState) {
            delete this.rootState[key]
          }
          Object.assign(this.rootState, state)
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: ((this.state && this.state.updates) || 0) + 1
          })
        }
        break
      }
    }
  }

  resizeFn = () => {
    const deviceSize = this.deviceSizeState
    if (deviceSize !== this.state.state.deviceSize) {
      this.setState({
        ...this.state,
        updates: ((this.state && this.state.updates) || 0) + 1,
        state: Object.assign(this.rootState, {
          ...this.state.state,
          deviceSize
        })
      })
    }
  }

  resizeListener = Builder.isEditing
    ? throttle(this.resizeFn, 200)
    : debounce(this.resizeFn, 400)

  static renderInto(
    elementOrSelector: string | HTMLElement,
    props: BuilderPageProps = {},
    hydrate = true,
    fresh = false
  ) {
    console.debug(
      'BuilderPage.renderInto',
      elementOrSelector,
      props,
      hydrate,
      this
    )
    let element =
      elementOrSelector instanceof HTMLElement
        ? elementOrSelector
        : document.querySelector(elementOrSelector)

    if (!element) {
      return
    }

    const exists = element.classList.contains('builder-hydrated')
    if (exists && !fresh) {
      console.debug('Tried to hydrate multiple times')
      return
    }
    element.classList.add('builder-hydrated')

    let shouldHydrate = hydrate && element.innerHTML.includes('builder-block')

    if (!element.classList.contains('builder-component')) {
      // TODO: maybe remove any builder-api-styles...
      const apiStyles =
        element.querySelector('.builder-api-styles') ||
        (element.previousElementSibling &&
        element.previousElementSibling.matches('.builder-api-styles')
          ? element.previousElementSibling
          : null)
      let keepStyles = ''
      if (apiStyles) {
        const html = apiStyles.innerHTML
        html.replace(
          /\/\*start:([^\*]+?)\*\/([\s\S]*?)\/\*end:([^\*]+?)\*\//g,
          (match, id, content) => {
            let el: HTMLElement | null = null
            try {
              el = document.querySelector(`[data-emotion-css="${id}"]`)
            } catch (err) {
              console.warn(err)
            }
            if (el) {
              el.innerHTML = content
            } else if (!Builder.isEditing) {
              keepStyles += match
            }

            return match
          }
        )
        // NextTick? or longer timeout?
        Builder.nextTick(() => {
          apiStyles.innerHTML = keepStyles
        })
      }
      const useElement = element.querySelector('.builder-component')
      if (useElement) {
        element = useElement
      } else {
        shouldHydrate = false
      }
    }

    if (location.search.includes('builder.debug=true')) {
      console.debug('hydrate', shouldHydrate, element)
    }

    let useEl = element
    if (!exists) {
      const div = document.createElement('div')
      element.insertAdjacentElement('beforebegin', div)
      div.appendChild(element)
      useEl = div
    }

    if (
      Builder.isEditing ||
      (Builder.isBrowser && location.search.includes('builder.preview='))
    ) {
      shouldHydrate = false
    }
    if (shouldHydrate && element) {
      // TODO: maybe hydrate again. Maybe...
      const val = ReactDOM.render(
        <BuilderPage {...props} />,
        useEl,
        (useEl as any).builderRootRef
      )
      ;(useEl as any).builderRootRef = val
      return val
    }
    const val = ReactDOM.render(
      <BuilderPage {...props} />,
      useEl,
      (useEl as any).builderRootRef
    )
    ;(useEl as any).builderRootRef = val
    return val
  }

  mounted = false

  componentDidMount() {
    this.mounted = true
    if (this.asServer) {
      this.asServer = false
      this.updateState(state => {
        state.isBrowser = true
        state.isServer = false
      })
    }

    if (Builder.isIframe) {
      window.parent?.postMessage(
        { type: 'builder.sdkInjected', data: { modelName: this.name } },
        '*'
      )
    }

    if (Builder.isBrowser) {
      // TODO: remove event on unload
      window.addEventListener('resize', this.resizeListener)
      if (Builder.isEditing) {
        window.addEventListener('message', this.messageListener)
      }

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('builder:component:load', {
            detail: {
              ref: this
            }
          })
        )
      })
    }
  }

  updateState = (fn?: (state: any) => void) => {
    const state = this.rootState
    if (fn) {
      fn(state)
    }
    if (this.mounted) {
      this.setState({
        update: this.updateState,
        state,
        updates: ((this.state && this.state.updates) || 0) + 1
      })
    } else {
      this.state = {
        ...this.state,
        update: this.updateState,
        state,
        updates: ((this.state && this.state.updates) || 0) + 1
      }
    }

    this.notifyStateChange()
  }

  @debounceNextTick
  notifyStateChange() {
    if (!(this && this.state)) {
      return
    }
    const nextState = this.state.state
    // TODO: only run the below once per tick...
    if (this.props.onStateChange) {
      this.props.onStateChange(nextState)
    }

    if (Builder.isBrowser) {
      window.dispatchEvent(
        new CustomEvent('builder:component:stateChange', {
          detail: {
            state: nextState,
            ref: this
          }
        })
      )
    }
    this.onStateChange.next(nextState)
  }

  processStateFromApi(state: { [key: string]: any }) {
    return state //  mapValues(state, value => tryEval(value, this.data, this._errors))
  }

  get location() {
    return this.props.location || (Builder.isBrowser ? location : ({} as any))
  }

  getCssFromFont(font: any, data?: any) {
    // TODO: compute what font sizes are used and only load those.......
    const family =
      font.family +
      (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '')
    const name = family.split(',')[0]
    const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular
    let str = ''
    if (url && family && name) {
      str += `
@font-face {
  font-family: ${family};
  src: local("${name}"), url('${url}') format('woff2');
  font-display: swap;
  font-weight: 400;
}
        `.trim()
    }

    if (font.files) {
      for (const weight in font.files) {
        const isNumber = String(Number(weight)) === weight
        if (!isNumber) {
          continue
        }
        // TODO: maybe limit number loaded
        const weightUrl = font.files[weight]
        if (weightUrl && weightUrl !== url) {
          str += `
@font-face {
  font-family: ${family};
  src: url('${weightUrl}') format('woff2');
  font-display: swap;
  font-weight: ${weight};
}
          `.trim()
        }
      }
    }
    return str
  }

  componentWillUnmount() {
    this.unsubscribe()
    if (Builder.isBrowser) {
      window.removeEventListener('resize', this.resizeListener)
      window.removeEventListener('message', this.messageListener)
    }
  }

  getFontCss(data: any) {
    // TODO: separate internal data from external
    return (
      (data.customFonts &&
        data.customFonts.length &&
        data.customFonts
          .map((font: any) => this.getCssFromFont(font, data))
          .join(' ')) ||
      ''
    )
  }

  ensureFontsLoaded(data: any) {
    if (data.customFonts && Array.isArray(data.customFonts)) {
      for (const font of data.customFonts) {
        const url = font.fileUrl
          ? font.fileUrl
          : font.files && font.files.regular
        if (!fontsLoaded.has(url)) {
          const html = this.getCssFromFont(font, data)
          fontsLoaded.add(url)
          if (!html) {
            continue
          }
          const style = document.createElement('style')
          style.className = 'builder-custom-font'
          style.setAttribute('data-builder-custom-font', url)
          style.innerHTML = html
          document.head.appendChild(style)
        }
      }
    }
  }

  getCss(data: any) {
    const contentId = this.useContent?.id
    let cssCode = data?.cssCode || ''
    if (contentId) {
      // Allow using `&` in custom CSS code like @emotion
      // E.g. `& .foobar { ... }` to scope CSS
      // TODO: handle if '&' is within a string like `content: "&"`
      cssCode = cssCode.replace(/&/g, `.builder-component-${contentId}`)
    }

    return cssCode + this.getFontCss(data)
  }

  get data() {
    const data = {
      ...(this.props.content && this.props.content.data.state),
      ...this.props.data,
      ...this.state.state
    }
    Object.assign(this.rootState, data)
    return data
  }

  componentDidUpdate(prevProps: BuilderPageProps) {
    // TODO: shallow diff
    if (this.props.data && prevProps.data !== this.props.data) {
      this.state.update((state: any) => {
        Object.assign(state, this.props.data)
      })
    }

    if (Builder.isEditing) {
      if (this.props.content && prevProps.content !== this.props.content) {
        this.onContentLoaded(this.props.content)
      }
    }
  }

  // FIXME: workaround to issue with CSS extraction and then hydration
  // (might be preact only)
  checkStyles(data: any) {
    if (this.styleRef) {
      const css = this.getCss(data)
      if (this.styleRef.innerHTML !== css) {
        this.styleRef.innerHTML = css
      }
    }
  }

  reload() {
    this.setState({
      key: this.state.key + 1
    })
  }

  get content() {
    let { content } = this.props
    if (content && content.content) {
      // GraphQL workaround
      content = {
        ...content,
        data: content.content
      }
    }
    return content
  }

  get useContent() {
    return this.content || this.state.context.builderContent
  }

  render() {
    const content = this.content

    const dataString =
      this.props.data && size(this.props.data) && hash(this.props.data)
    let key = Builder.isEditing ? this.name : this.props.entry
    if (key && !Builder.isEditing && dataString && dataString.length < 300) {
      key += ':' + dataString
    }

    const WrapComponent = this.props.dataOnly ? React.Fragment : 'div'

    const contentId = this.useContent?.id

    return (
      // TODO: data attributes for model, id, etc?
      <WrapComponent
        className={`builder-component ${
          contentId ? `builder-component-${contentId}` : ''
        }`}
        data-name={this.name}
        date-source={`Rendered by Builder.io on ${new Date().toUTCString()}`}
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
                      ampMode: this.props.ampMode
                    }
                  : value
              }
            >
              <BuilderAsyncRequestsContext.Consumer>
                {value => {
                  this._asyncRequests = value && value.requests
                  this._errors = value && value.errors
                  this._logs = value && value.logs

                  return (
                    <BuilderContent
                      builder={this.builder}
                      ref={ref => (this.contentRef = ref)}
                      inline={this.props.inlineContent}
                      // TODO: pass entry in
                      contentLoaded={this.onContentLoaded}
                      options={{
                        key,
                        entry: this.props.entry,
                        ...(content &&
                          size(content) && { initialContent: [content] }),
                        ...this.props.options
                      }}
                      contentError={this.props.contentError}
                      modelName={this.name || 'page'}
                    >
                      {(data, loading, fullData) => {
                        if (this.props.dataOnly) {
                          return null
                        }

                        if (fullData && fullData.id) {
                          this.state.context.builderContent = fullData
                        }
                        if (Builder.isBrowser) {
                          Builder.nextTick(() => {
                            this.checkStyles(data)
                          })
                        }
                        // TODO: loading option - maybe that is what the children is or component prop
                        // TODO: get rid of all these wrapper divs
                        return data ? (
                          <div
                            data-builder-component={this.name}
                            data-builder-content-id={fullData.id}
                            data-builder-variation-id={
                              fullData.testVariationId ||
                              fullData.variationId ||
                              fullData.id
                            }
                          >
                            {this.getCss(data) && (
                              <style
                                ref={ref => (this.styleRef = ref)}
                                className="builder-custom-styles"
                                dangerouslySetInnerHTML={{
                                  __html: this.getCss(data)
                                }}
                              />
                            )}
                            <BuilderStoreContext.Provider
                              value={{
                                ...this.state,
                                rootState: this.rootState,
                                state: this.data,
                                content: fullData,
                                renderLink: this.props.renderLink
                              }}
                            >
                              <BuilderBlocks
                                key={String(!!data?.blocks?.length)}
                                emailMode={this.props.emailMode}
                                fieldName="blocks"
                                blocks={data.blocks}
                              />
                            </BuilderStoreContext.Provider>
                          </div>
                        ) : loading ? (
                          <div
                            data-builder-component={this.name}
                            className="builder-loading"
                          >
                            {this.props.children}
                          </div>
                        ) : (
                          <div
                            data-builder-component={this.name}
                            className="builder-no-content"
                          />
                        )
                      }}
                    </BuilderContent>
                  )
                }}
              </BuilderAsyncRequestsContext.Consumer>
            </BuilderMetaContext.Provider>
          )}
        </BuilderMetaContext.Consumer>
      </WrapComponent>
    )
  }

  evalExpression(expression: string) {
    const { data } = this
    return expression.replace(/{{([^}]+)}}/g, (match, group) =>
      tryEval(group, data, this._errors)
    )
  }

  // TODO: customizable hm
  @Throttle(100, { leading: true, trailing: true })
  throttledHandleRequest(propertyName: string, url: string) {
    return this.handleRequest(propertyName, url)
  }

  async handleRequest(propertyName: string, url: string) {
    // TODO: Builder.isEditing = just checks if iframe and parent page is this.builder.io or localhost:1234
    if (Builder.isIframe && fetchCache[url]) {
      this.updateState(ctx => {
        ctx[propertyName] = fetchCache[url]
      })
      return fetchCache[url]
    }
    const request = async () => {
      const requestStart = Date.now()
      if (!Builder.isBrowser) {
        console.time('Fetch ' + url)
      }
      let json: any
      try {
        const result = await fetch(url)
        json = await result.json()
      } catch (err) {
        if (this._errors) {
          this._errors.push(err)
        }
        if (this._logs) {
          this._logs.push(
            `Fetch to ${url} errored in ${Date.now() - requestStart}ms`
          )
        }
        return
      } finally {
        if (!Builder.isBrowser) {
          console.timeEnd('Fetch ' + url)
          if (this._logs) {
            this._logs.push(`Fetched ${url} in ${Date.now() - requestStart}ms`)
          }
        }
      }

      if (json) {
        if (Builder.isIframe) {
          fetchCache[url] = json
        }
        // TODO: debounce next tick all of these when there are a bunch
        this.updateState(ctx => {
          ctx[propertyName] = json
        })
      }

      return json
    }
    const existing =
      this._asyncRequests &&
      (this._asyncRequests.find(
        req => isRequestInfo(req) && req.url === url
      ) as RequestInfo | null)
    if (existing) {
      const promise = existing.promise
      promise.then(json => {
        if (json) {
          this.updateState(ctx => {
            ctx[propertyName] = json
          })
        }
      })
      return promise
    }
    const promise = request()
    Builder.nextTick(() => {
      if (this._asyncRequests) {
        this._asyncRequests.push(promise)
      }
    })
    return promise
  }

  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe()
      this.subscriptions = new Subscription()
    }
  }

  handleBuilderRequest(propertyName: string, optionsString: string) {
    const options = tryEval(optionsString, this.data, this._errors)
    // TODO: this will screw up for multiple bits of data
    if (this.subscriptions) {
      this.unsubscribe()
    }
    // TODO: don't unsubscribe and resubscribe every time data changes, will make a TON of requests if that's the case when editing...
    // I guess will be cached then
    if (options) {
      // TODO: unsubscribe on destroy
      this.subscriptions.add(
        this.builder
          .queueGetContent(options.model, options)
          .subscribe(matches => {
            if (matches) {
              this.updateState(ctx => {
                ctx[propertyName] = matches
              })
            }
          })
      )
    }
  }

  onContentLoaded = (data: any) => {
    if (data && data.meta && data.meta.kind === 'page') {
      const future = new Date()
      future.setDate(future.getDate() + 30)
      this.builder.setCookie(
        'builder.lastPageViewed',
        [data.id, data.variationId || data.testVariationId || data.id].join(
          ','
        ),
        future
      )
    }

    // if (Builder.isBrowser) {
    //   console.debug('Builder content load', data)
    // }
    // TODO: if model is page... hmm
    if (
      (this.name === 'page' || this.name === 'docs-content') &&
      Builder.isBrowser
    ) {
      if (data) {
        const { title, pageTitle, description, pageDescription } = data

        if (title || pageTitle) {
          document.title = title || pageTitle
        }

        if (description || pageDescription) {
          let descriptionTag = document.querySelector(
            'meta[name="description"]'
          )

          if (!descriptionTag) {
            descriptionTag = document.createElement('meta')
            descriptionTag.setAttribute('name', 'description')
            document.head.appendChild(descriptionTag)
          }

          descriptionTag.setAttribute('content', description || pageDescription)
        }
      }
    }

    if (Builder.isEditing) {
      this.notifyStateChange()
    }

    // Unsubscribe all? TODO: maybe don't continuous fire when editing.....
    if (this.props.contentLoaded) {
      this.props.contentLoaded(data)
    }

    if (
      data &&
      data.inputs &&
      Array.isArray(data.inputs) &&
      data.inputs.length
    ) {
      if (!data.state) {
        data.state = {}
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
            data.state[input.name] = input.defaultValue
          }
        }
      })
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
          ...this.props.data
        })
      }
      if (this.mounted) {
        this.setState(newState)
      } else {
        this.state = newState
      }
    }

    // TODO: also throttle on edits maybe
    if (data && data.jsCode && Builder.isBrowser) {
      // Don't rerun js code when editing and not changed
      let skip = false
      if (Builder.isEditing) {
        if (this.lastJsCode === data.jsCode) {
          skip = true
        } else {
          this.lastJsCode = data.jsCode
        }
      }

      if (!skip) {
        const state = this.state.state

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
          )(
            data,
            this,
            state,
            this.state.update,
            this.ref,
            Builder,
            builder,
            this.state.context
          )

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
            )
          } else {
            if (process.env.DEBUG) {
              console.debug(
                'Builder custom code error:',
                error.message,
                'in',
                data.jsCode,
                error.stack
              )
            }
            // Add to req.options.errors to return to client
          }
        }
      }
    }

    if (
      data &&
      data.httpRequests /* || data.builderData @DEPRECATED */ &&
      !this.props.noAsync
    ) {
      // Don't rerun http requests when editing and not changed
      // No longer needed?
      let skip = false

      if (!skip) {
        // TODO: another structure for this
        for (const key in data.httpRequests) {
          const url: string | undefined = data.httpRequests[key]
          if (url && (!this.data[key] || Builder.isEditing)) {
            // TODO: if Builder.isEditing and url patches https://builder.io/api/v2/content/{editingModel}
            // Then use this.builder.get().subscribe(...)
            if (Builder.isBrowser) {
              const finalUrl = this.evalExpression(url)
              if (
                Builder.isEditing &&
                this.lastHttpRequests[key] === finalUrl
              ) {
                continue
              }
              this.lastHttpRequests[key] = finalUrl
              const builderModelRe = /builder\.io\/api\/v2\/([^\/\?]+)/i
              const builderModelMatch = url.match(builderModelRe)
              const model = builderModelMatch && builderModelMatch[1]
              if (
                false &&
                Builder.isEditing &&
                model &&
                this.builder.editingModel === model
              ) {
                this.throttledHandleRequest(key, finalUrl)
                // TODO: fix this
                // this.subscriptions.add(
                //   this.builder.get(model).subscribe(data => {
                //     this.state.update((state: any) => {
                //       state[key] = data
                //     })
                //   })
                // )
              } else {
                this.throttledHandleRequest(key, finalUrl)
                const currentSubscription = this.httpSubscriptionPerKey[key]
                if (currentSubscription) {
                  currentSubscription.unsubscribe()
                }

                // TODO: fix this
                const newSubscription = (this.httpSubscriptionPerKey[
                  key
                ] = this.onStateChange.subscribe(() => {
                  const newUrl = this.evalExpression(url)
                  if (newUrl !== finalUrl) {
                    this.throttledHandleRequest(key, newUrl)
                    this.lastHttpRequests[key] = newUrl
                  }
                }))
                this.subscriptions.add(newSubscription)
              }
            } else {
              this.handleRequest(key, this.evalExpression(url))
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
  }
}
