import React from 'react'
import ReactDOM from 'react-dom'
import { BuilderContent } from './builder-content.component'
import { BuilderBlocks } from './builder-blocks.component'
import { Builder, GetContentOptions, builder, Subscription, BehaviorSubject, BuilderElement } from '@builder.io/sdk'
import { BuilderStoreContext } from '../store/builder-store'
import hash from 'hash-sum'
import onChange from 'lib/on-change.js'

import { sizes } from '../constants/device-sizes.constant'
import {
  BuilderAsyncRequestsContext,
  RequestOrPromise,
  RequestInfo,
  isRequestInfo
} from '../store/builder-async-requests'
import { Url } from 'url'
import { debounceNextTick } from '../functions/debonce-next-tick'

const size = (thing: object) => Object.keys(thing).length

export function throttle(func: Function, wait: number, options: any = {}) {
  let context: any
  let args: any
  let result: any
  let timeout = null as any
  let previous = 0
  const later = function() {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function(this: any) {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

function attempt<T extends any>(fn: () => T) {
  try {
    return fn()
  } catch (err) {
    return err
  }
}

function pick(object: any, keys: string[]) {
  return keys.reduce(
    (obj, key) => {
      if (object && object.hasOwnProperty(key)) {
        obj[key] = object[key]
      }
      return obj
    },
    {} as any
  )
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
  entry?: string
  apiKey?: string
  options?: GetContentOptions
  contentLoaded?: (data: any) => void
  contentError?: (error: any) => void
  content?: any
  location?: Location | Url
  onStateChange?: (newData: any) => void
  noAsync?: boolean
  emailMode?: boolean
  inlineContent?: boolean
  builderBlock?: BuilderElement
}

interface BuilderPageState {
  state: any
  update: (state: any) => any
  updates: number
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
      ///SERVERONLY const { VM } = require('vm2')
      ///SERVERONLY return new VM({
      ///SERVERONLY   sandbox: {
      ///SERVERONLY     ...data,
      ///SERVERONLY     ...{ state: data }
      ///SERVERONLY   }
      ///SERVERONLY   // TODO: convert reutrn to module.exports on server
      ///SERVERONLY }).run(value.replace(/^return /, ''))
      // tslint:enable:comment-format
    }
  } catch (error) {
    if (errors) {
      errors.push(error)
    }

    if (Builder.isBrowser) {
      console.warn('Builder custom code error:', error.message, 'in', str, error.stack)
    } else {
      if (process.env.DEBUG) {
        console.debug('Builder custom code error:', error.message, 'in', str, error.stack)
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

export class BuilderPage extends React.Component<BuilderPageProps, BuilderPageState> {
  subscriptions: Subscription = new Subscription()
  onStateChange = new BehaviorSubject<any>(null)

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

  constructor(props: BuilderPageProps) {
    super(props)

    this.state = {
      state: Object.assign(this.rootState, {
        ...(this.props.content && this.props.content.data && this.props.content.data.state),
        isBrowser: true,
        location: this.locationState,
        deviceSize: this.deviceSizeState,
        // TODO: will user attributes be ready here?
        device: this.device,
        ...props.data
      }),
      updates: 0,
      update: this.updateState
    }

    if (Builder.isBrowser) {
      const key = this.props.apiKey
      if (key && key !== builder.apiKey) {
        builder.apiKey = key
      }

      if (this.props.content) {
        // TODO: this should be on didMount right bc of element ref??
        // TODO: possibly observe for change or throw error if changes
        this.onContentLoaded(
          this.props.content.content || this.props.content.data /*, this.props.content*/
        )
      }
    }
  }

  // TODO: pass down with context
  get device() {
    return builder.getUserAttributes().device || 'desktop'
  }

  get locationState() {
    return {
      // TODO: handle this correctly on the server. Pass in with CONTEXT
      ...pick(this.location, ['pathname', 'hostname', 'search', 'host']),
      path: (this.location.pathname && this.location.pathname.split('/').slice(1)) || '',
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
      case 'builder.resetState': {
        const { state, model } = info.data.state
        if (model == this.name) {
          for (const key in this.rootState) {
            delete this.rootState[key]
          }
          Object.assign(this.rootState, state)
          this.setState({
            ...this.state,
            state: this.rootState,
            updates: (this.state && this.state.updates || 0) + 1,
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
            updates: (this.state && this.state.updates || 0) + 1,
          })
        }
        break
      }
    }
  }

  resizeListener = throttle(
    () => {
      const deviceSize = this.deviceSizeState
      if (deviceSize !== this.state.state.deviceSize) {
        this.setState({
          ...this.state,
          updates: (this.state && this.state.updates || 0) + 1,
          state: Object.assign(this.rootState, {
            ...this.state.state,
            deviceSize
          })
        })
      }
    },
    200,
    { leading: false, trailing: true }
  )

  // TODO: different options per device size...........................

  static renderInto(
    elementOrSelector: string | HTMLElement,
    props: BuilderPageProps = {},
    hydrate = true
  ) {
    let element =
      elementOrSelector instanceof HTMLElement
        ? elementOrSelector
        : document.querySelector(elementOrSelector)

    if (!element) {
      return
    }

    let shouldHydrate = hydrate && element.innerHTML.includes('builder-block')
    if (shouldHydrate && !element.classList.contains('builder-component')) {
      // TODO: maybe remove any builder-api-styles...
      const apiStyles =
        element.querySelector('.builder-api-styles') ||
        (element.previousElementSibling &&
        element.previousElementSibling.matches('.builder-api-styles')
          ? element.previousElementSibling
          : null)
      if (apiStyles) {
        setTimeout(() => {
          apiStyles.remove()
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
    const div = document.createElement('div')
    element.insertAdjacentElement('beforebegin', div)
    div.appendChild(element)
    if (shouldHydrate && element) {
      return ReactDOM.hydrate(<BuilderPage {...props} />, div)
    }
    return ReactDOM.render(<BuilderPage {...props} />, div)
  }

  componentDidMount() {
    if (Builder.isIframe) {
      parent.postMessage({ type: 'builder.sdkInjected', data: { modelName: this.name } }, '*')
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
    this.setState({
      update: this.updateState,
      state,
      updates: (this.state && this.state.updates || 0) + 1
    })

    this.notifyStateChange()
  }

  @debounceNextTick
  notifyStateChange() {
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

  getCssFromFont(font: any) {
    const family = font.family + (font.kind && !font.kind.includes('#') ? ', ' + font.kind : '')
    const name = family.split(',')[0]
    const url = font.fileUrl ? font.fileUrl : font.files && font.files.regular
    if (url && family && name) {
      return `
        @font-face {
          font-family: ${family};
          src: local("${name}"), url('${url}');
          font-display: fallback;
        }
        `
    }
    return ''
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
      data.customFonts &&
      data.customFonts.length &&
      data.customFonts.map((font: any) => this.getCssFromFont(font)).join(' ')
    )
  }

  getCss(data: any) {
    // .replace(/([^\s]|$)&([^\w])/g, '$1' + '.some-selector' + '$2')
    return (
      `\n\n/** *** Generated by Builder.io on ${new Date().toUTCString()} *** **/\n\n` +
      (data.cssCode || '') +
      (this.getFontCss(data) || '')
    )
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

  render() {
    let { content } = this.props
    if (content && content.content) {
      // GraphQL workaround
      content = {
        ...content,
        data: content.content
      }
    }

    const dataString = this.props.data && size(this.props.data) && hash(this.props.data)
    let key = Builder.isEditing ? this.name : this.props.entry
    if (!Builder.isEditing && dataString && dataString.length < 300) {
      key += ':' + dataString
    }

    return (
      // TODO: data attributes for model, id, etc?
      <div className="builder-component" data-name={this.name} ref={ref => (this.ref = ref)}>
        <BuilderAsyncRequestsContext.Consumer>
          {value => {
            this._asyncRequests = value && value.requests
            this._errors = value && value.errors
            this._logs = value && value.logs

            return (
              <BuilderStoreContext.Provider
                value={{
                  ...this.state,
                  rootState: this.rootState,
                  state: this.data
                }}
              >
                {/* Global styles */}
                {/* {Builder.isBrowser && (
                <style>
                  {`
                  .builder-block {
                    transition: all 0.2s ease-in-out;
                  }
                `}
                </style>
              )} */}

                {/* TODO: never use this? */}
                <BuilderContent
                  inline={this.props.inlineContent}
                  // TODO: pass entry in
                  contentLoaded={this.onContentLoaded}
                  options={{
                    key,
                    entry: this.props.entry,
                    ...(content && size(content) && { initialContent: [content] }),
                    ...this.props.options
                  }}
                  contentError={this.props.contentError}
                  modelName={this.name || 'page'}
                >
                  {(data, loading, fullData) => {
                    // TODO: loading option - maybe that is what the children is or component prop
                    return data ? (
                      <div
                        data-builder-component={this.name}
                        data-builder-content-id={fullData.id}
                        data-builder-variation-id={fullData.variationId}
                      >
                        {this.getCss(data) && (
                          <style dangerouslySetInnerHTML={{ __html: this.getCss(data) }} />
                        )}
                        {
                          <BuilderBlocks
                            emailMode={this.props.emailMode}
                            fieldName="blocks"
                            blocks={data.blocks}
                          />
                        }
                        {/* {data.jsCode && <script dangerouslySetInnerHTML={{ __html: data.jsCode }} />} */}
                      </div>
                    ) : loading ? (
                      <div data-builder-component={this.name} className="builder-loading">
                        {this.props.children}
                      </div>
                    ) : (
                      <div data-builder-component={this.name} className="builder-no-content" />
                    )
                  }}
                </BuilderContent>
              </BuilderStoreContext.Provider>
            )
          }}
        </BuilderAsyncRequestsContext.Consumer>
      </div>
    )
  }

  evalExpression(expression: string) {
    const { data } = this
    return expression.replace(/{{([^}]+)}}/g, (match, group) => tryEval(group, data, this._errors))
  }

  // TODO: customizable hm
  @Throttle(100, { leading: true, trailing: true })
  throttledHandleRequest(propertyName: string, url: string) {
    return this.handleRequest(propertyName, url)
  }

  async handleRequest(propertyName: string, url: string) {
    // TODO: Builder.isEditing = just checks if iframe and parent page is builder.io or localhost:1234
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
          this._logs.push(`Fetch to ${url} errored in ${Date.now() - requestStart}ms`)
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
      (this._asyncRequests.find(req => isRequestInfo(req) && req.url === url) as RequestInfo | null)
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
        builder.queueGetContent(options.model, options).subscribe(matches => {
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
    // if (Builder.isBrowser) {
    //   console.debug('Builder content load', data)
    // }
    // TODO: if model is page... hmm
    if ((this.name === 'page' || this.name === 'docs-content') && Builder.isBrowser) {
      if (data) {
        const { title, description } = data

        if (title) {
          document.title = title
        }

        if (description) {
          let descriptionTag = document.querySelector('meta[name="description"]')

          if (!descriptionTag) {
            descriptionTag = document.createElement('meta')
            descriptionTag.setAttribute('name', 'description')
            document.head.appendChild(descriptionTag)
          }

          descriptionTag!.setAttribute('content', description)
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

    if (data && data.inputs && Array.isArray(data.inputs) && data.inputs.length) {
      if (!data.state) {
        data.state = {}
      }
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
      this.setState({
        ...this.state,
        updates: (this.state && this.state.updates || 0) + 1,
        state: Object.assign(this.rootState, {
          ...this.state.state,
          location: this.locationState,
          deviceSize: this.deviceSizeState,
          device: this.device,
          ...data.state,
          ...this.props.data
        })
      })
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
            data.jsCode
          )(data, this, state, this.state.update, this.ref, Builder, builder)

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

    if (data && data.httpRequests /* || data.builderData @DEPRECATED */ && !this.props.noAsync) {
      // Don't rerun http requests when editing and not changed
      // No longer needed?
      let skip = false

      if (!skip) {
        // TODO: another structure for this
        for (const key in data.httpRequests) {
          const url: string | undefined = data.httpRequests[key]
          if (url && (!this.data[key] || Builder.isEditing)) {
            // TODO: if Builder.isEditing and url patches https://builder.io/api/v2/content/{editingModel}
            // Then use builder.get().subscribe(...)
            if (Builder.isBrowser) {
              const finalUrl = this.evalExpression(url)
              if (Builder.isEditing && this.lastHttpRequests[key] === finalUrl) {
                continue
              }
              this.lastHttpRequests[key] = finalUrl
              const builderModelRe = /builder\.io\/api\/v2\/([^\/\?]+)/i
              const builderModelMatch = url.match(builderModelRe)
              const model = builderModelMatch && builderModelMatch[1]
              if (false && Builder.isEditing && model && builder.editingModel === model) {
                this.throttledHandleRequest(key, finalUrl)
                // TODO: fix this
                // this.subscriptions.add(
                //   builder.get(model).subscribe(data => {
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
