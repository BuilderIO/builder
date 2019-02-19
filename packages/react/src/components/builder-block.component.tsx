import React from 'react'
import { Builder, Component } from '@builder.io/sdk'

import { sizeNames, Size, sizes } from '../constants/device-sizes.constant'
import { BuilderStoreContext } from '../store/builder-store'
import get from 'lodash-es/get'
import isArray from 'lodash-es/isArray'
import last from 'lodash-es/last'
import set from 'lodash-es/set'
import includes from 'lodash-es/includes'
import reduce from 'lodash-es/reduce'
import omit from 'lodash-es/omit'
import memoize from 'lodash-es/memoize'
import kebabCase from 'lodash-es/kebabCase'
import { BuilderAsyncRequestsContext, RequestOrPromise } from '../store/builder-async-requests'

const fnCache: { [key: string]: Function } = {}

const cssCase = (property: string) => {
  if (!property) {
    return property
  }

  let str = kebabCase(property)

  if (property[0] === property[0].toUpperCase()) {
    str = '--' + str
  }

  return str
}

// TODO: more API
// TODO: make shared with other evals
const api = (state: any) => ({
  // TODO: trigger animation
  use: (value: any) => value,
  useText: (value: any) => value,
  useSwitch: (value: any) => value,
  useNumber: (value: any) => value,
  run: (cb: Function) => cb(),
  return: (value: any) => value,
  set: (name: string, value: any) => {
    // need reference to state to set
    state[name] = value
  },
  get: (name: string, value: any) => {
    // need reference to state to set
    return state[name]
  },
  get device() {
    return Builder.isBrowser
      ? ['large', 'medium', 'small'].indexOf(sizes.getSizeForWidth(window.innerWidth))
      : 0 // TODO: by useragent?
  },
  deviceIs(device: number) {
    return this.device === device
  }
})

// TODO: pull from builer internal utils
const fastClone = (obj: object) => JSON.parse(JSON.stringify(obj))

// TODO: share these types in shared
type ElementType = any

interface StringMap {
  [key: string]: string | undefined | null
}
function mapToCss(map: StringMap, spaces = 2, important = false) {
  return reduce(
    map,
    (memo, value, key) => {
      return (
        memo +
        (value && value.trim()
          ? `\n${' '.repeat(spaces)}${cssCase(key)}: ${value + (important ? ' !important' : '')};`
          : '')
      )
    },
    ''
  )
}

export interface BuilderBlockProps {
  fieldName?: string
  block: any
  child?: boolean
  index?: number
  size?: Size
  emailMode?: boolean
}

function capitalize(str: string) {
  if (!str) {
    return
  }
  return str[0].toUpperCase() + str.slice(1)
}

interface BuilderBlocksState {
  state: any
  update: Function
}

export class BuilderBlock extends React.Component<BuilderBlockProps> {
  private _asyncRequests?: RequestOrPromise[]
  private _errors?: Error[]
  private _logs?: string[]

  private privateState: BuilderBlocksState = {
    state: {},
    update: () => {
      /* Intentionally empty */
    }
  }

  // TODO: handle adding return if none provided
  // TODO: cache/memoize this (globally with LRU?)
  stringToFunction(str: string, expression = true) {
    if (!str || !str.trim()) {
      return () => undefined
    }

    const cacheKey = str + ':' + expression
    if (fnCache[cacheKey]) {
      return fnCache[cacheKey]
    }

    // FIXME: gross hack
    const useReturn =
      (expression && !(str.includes(';') || str.includes(' return '))) ||
      str.trim().startsWith('builder.run')
    let fn: Function = () => {
      /* intentionally empty */
    }

    str = str
      .replace(/builder\s*\.\s*use[a-zA-Z]*\(/g, 'return(')
      .replace(/builder\s*\.\s*set([a-zA-Z]+)To\(/g, (_match, group: string) => {
        return `builder.set("${group[0].toLowerCase() + group.substring(1)}",`
      })
      .replace(/builder\s*\.\s*get([a-zA-Z]+)\s*\(\s*\)/g, (_match, group: string) => {
        return `state.${group[0].toLowerCase() + group.substring(1)}`
      })

    try {
      // tslint:disable-next-line:no-function-constructor-with-string-args
      if (Builder.isBrowser) {
        fn = new Function(
          'state',
          'event',
          'block',
          'builder',
          'Device',
          'update',
          // TODO: block reference...
          `with (state) {
            ${useReturn ? `return (${str});` : str};
          }`
        )
      }
    } catch (error) {
      if (this._errors) {
        this._errors.push(error)
      }
      const message = error && error.message
      if (message && typeof message === 'string') {
        if (this._logs && this._logs.indexOf(message) === -1) {
          this._logs.push(message)
        }
      }
      console.warn(`Function compile error in ${str}`, error)
    }

    const final = (fnCache[cacheKey] = (...args: any[]) => {
      try {
        if (Builder.isBrowser) {
          return fn(...args)
        } else {
          // TODO: memoize on server
          // TODO: use something like this instead https://www.npmjs.com/package/rollup-plugin-strip-blocks
          // There must be something more widely used?
          // TODO: regex for between comments instead so can still type check the code... e.g. //SERVER-START ... code ... //SERVER-END
          // Below is a hack to get certain code to *only* load in the server build, to not screw with
          // browser bundler's like rollup and webpack. Our rollup plugin strips these comments only
          // for the server build
          // TODO: cache these for better performancs with new VmScript
          // tslint:disable:comment-format
          ///SERVERONLY const { VM } = require('vm2')
          ///SERVERONLY const [state, event] = args
          ///SERVERONLY return new VM({
          ///SERVERONLY   timeout: 100,
          ///SERVERONLY   sandbox: {
          ///SERVERONLY     ...state,
          ///SERVERONLY     ...{ state },
          ///SERVERONLY     ...{ builder: api },
          ///SERVERONLY     event
          ///SERVERONLY   }
          ///SERVERONLY }).run(str)
          // tslint:enable:comment-format
        }
      } catch (error) {
        console.warn('Eval error', error)
        if (this._errors) {
          this._errors.push(error)
        }
      }
    })

    return final
  }

  get styles() {
    // TODO: handle style bindings
    const { block, size } = this.props
    const styles = []
    const startIndex = sizeNames.indexOf(size || 'large')
    if (block.responsiveStyles) {
      for (let i = startIndex; i < sizeNames.length; i = i + 1) {
        const name = sizeNames[i]
        if (block.responsiveStyles[name]) {
          styles.push(block.responsiveStyles[name])
        }
      }
    }

    // On the server apply the initial animation state (TODO: maybe not for load time hm)
    // TODO: maybe /s/ server renders content pages hmm
    const isServer = !Builder.isBrowser
    let initialAnimationStepStyles: any
    if (isServer) {
      const animation = block.animations && block.animations[0]
      const firstStep = animation && animation.steps && animation.steps[0]
      const stepStyles = firstStep && firstStep.styles
      if (stepStyles) {
        initialAnimationStepStyles = stepStyles
      }
    }
    return Object.assign({}, ...styles.reverse(), initialAnimationStepStyles)
  }

  get css() {
    // TODO: handle style bindings
    const self = this.props.block

    const baseStyles: Partial<CSSStyleDeclaration> = {
      ...(self.responsiveStyles && self.responsiveStyles.large)
    }

    let css = this.props.emailMode
      ? ''
      : `.builder-block.${self.id} {${mapToCss(baseStyles as StringMap)}}`

    const reversedNames = sizeNames.slice().reverse()
    if (self.responsiveStyles) {
      for (const size of reversedNames) {
        if (this.props.emailMode && size === 'large') {
          continue
        }
        if (
          size !== 'large' &&
          size !== 'xsmall' &&
          self.responsiveStyles[size] &&
          Object.keys(self.responsiveStyles[size]).length
        ) {
          // TODO: this will not work as expected for a couple things that are handled specially,
          // e.g. width
          css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n${
            this.props.emailMode ? '.' : '.builder-block.'
          }${self.id + (this.props.emailMode ? '-subject' : '')} {${mapToCss(
            self.responsiveStyles[size],
            4,
            this.props.emailMode
          )} } }`
        }
      }
    }
    return css
  }

  componentDidMount() {
    const { block } = this.props
    const animations = block && block.animations
    if (animations) {
      const options = {
        animations: fastClone(animations)
      }

      // TODO: listen to Builder.editingMode and bind animations when editing
      // and unbind when not
      // TODO: apply bindings first
      if (block.bindings) {
        for (const key in block.bindings) {
          if (key.startsWith('animations.')) {
            const value = this.stringToFunction(block.bindings[key])
            if (value !== undefined) {
              set(options, key, value(this.privateState.state))
            }
          }
        }
      }
      Builder.animator.bindAnimations(
        options.animations.map((animation: any) => ({
          ...animation,
          elementId: this.props.block.id
        }))
      )
    }
  }

  // <!-- Builder Blocks --> in comments hmm
  getElement(index = 0, state = this.privateState.state): React.ReactNode {
    const { block, child, fieldName } = this.props
    let TagName = (block.tagName || 'div').toLowerCase()

    let InnerComponent: any
    const componentName = block.component && (block.component.name || block.component.component)
    let componentInfo: Component | null = null
    if (block.component && !block.component.class) {
      componentInfo = Builder.components.find(item => item.name === componentName) || null
      if (componentInfo && componentInfo.class) {
        InnerComponent = componentInfo.class
      }
    }

    const TextTag: string = 'span'

    const isBlock = !includes(
      ['absolute', 'fixed'],
      block.responsiveStyles &&
        block.responsiveStyles.large &&
        block.responsiveStyles.large.position /*( this.styles.position */
    )

    let options = {
      // Attributes?
      ...block.properties,
      style: {} // this.styles
    }

    options = {
      ...options.properties,
      ...options
    }

    if (block.component) {
      options.component = fastClone(block.component)
    }

    // Binding should be properties to href or href?
    // Manual style editor show bindings
    // Show if things bound in overlays hmm
    const Device = { desktop: 0, tablet: 1, mobile: 2 }
    if (block.bindings) {
      for (const key in block.bindings) {
        const value = this.stringToFunction(block.bindings[key])
        // TODO: pass block, etc
        set(options, key, value(state, null, block, api(state), Device))
      }
    }

    if (options.hide) {
      return null
    }

    let latestState = state

    if (block.actions) {
      for (const key in block.actions) {
        const value = block.actions[key]
        options['on' + capitalize(key)] = (event: any) => {
          const update = (cb: Function) => {
            this.privateState.update((globalState: any) => {
              latestState = globalState
              let localState = globalState

              if (typeof Proxy !== 'undefined') {
                localState = new Proxy(
                  { ...globalState },
                  {
                    getOwnPropertyDescriptor(target, property) {
                      try {
                        return Reflect.getOwnPropertyDescriptor(latestState, property)
                      } catch (error) {
                        return undefined
                      }
                    },
                    // TODO: wrap other proxy properties
                    set: function(target, key, value) {
                      return Reflect.set(latestState, key, value)
                    },
                    // to prevent variable doesn't exist errors with `with (state)`
                    has(target, property) {
                      try {
                        // TODO: if dead trigger an immer update
                        return Reflect.has(latestState, property)
                      } catch (error) {
                        return false
                      }
                    },
                    get(object, property) {
                      if (
                        property &&
                        typeof property === 'string' &&
                        property.endsWith('Item') &&
                        !Reflect.has(latestState, property)
                      ) {
                        // TODO: use $index to return a reference to the proxied version of item
                        // so can be set as well
                        return Reflect.get(state, property)
                      }

                      return Reflect.get(latestState, property)
                    }
                  }
                )
              }
              return cb(localState, event, undefined, api(localState), Device, update)
            })
          }
          const fn = this.stringToFunction(value, false)
          update(fn)
        }
      }
    }

    const innerComponentProperties = options.component && {
      ...options.options,
      ...(options.component.options || options.component.data)
    }

    const voidElements = [
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr'
    ]

    const isVoid = voidElements.indexOf(TagName) !== -1

    const noWrap =
      componentInfo && ((componentInfo as any).fragment || (componentInfo as any).noWrap)

    const finalOptions = {
      ...omit(options, 'class', 'component'),
      class:
        `builder-block ${this.id}${block.class ? ` ${block.class}` : ''}${
          block.component && !includes(['Image', 'Video', 'Banner'], componentName)
            ? ` builder-has-component`
            : ''
        }` + (options.class ? ' ' + options.class : ''),
      key: this.id + index,
      'builder-id': this.id
    }

    if (Builder.isIframe) {
      ;(finalOptions as any)['builder-inline-styles'] = !options.style
        ? ''
        : reduce(
            options.style,
            (memo, value, key) => (memo ? `${memo};` : '') + `${cssCase(key)}:${value};`,
            ''
          )
    }

    if (
      (((finalOptions as any).properties && (finalOptions as any).properties.href) ||
        (finalOptions as any).href) &&
      TagName === 'div'
    ) {
      TagName = 'a'
    }

    const css = this.css

    // TODO: test it out
    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._asyncRequests = value && value.requests
          this._errors = value && value.errors
          this._logs = value && value.logs
          return (
            <React.Fragment>
              {isVoid ? (
                <TagName {...finalOptions} />
              ) : InnerComponent && (noWrap || this.props.emailMode) ? (
                // TODO: pass the class to be easier
                // TODO: acceptsChildren option?
                <InnerComponent
                  // Final options maaay be wrong here hm
                  {...innerComponentProperties}
                  attributes={finalOptions}
                  builderBlock={block}
                />
              ) : (
                <TagName {...finalOptions}>
                  <React.Fragment>
                    {InnerComponent && (
                      <InnerComponent builderBlock={block} {...innerComponentProperties} />
                    )}
                    {block.text || options.text ? (
                      // TODO: remove me! No longer in use (maybe with rich text will be back tho)
                      <TextTag dangerouslySetInnerHTML={{ __html: options.text || block.text }} />
                    ) : !InnerComponent && block.children && block.children.length ? (
                      block.children.map((block: ElementType, index: number) => (
                        <BuilderBlock
                          key={((this.id as string) || '') + index}
                          block={block}
                          index={index}
                          size={this.props.size}
                          fieldName={this.props.fieldName}
                          child={this.props.child}
                          emailMode={this.props.emailMode}
                        />
                      ))
                    ) : null}
                  </React.Fragment>
                </TagName>
              )}
              {/* TODO: email mode style handling */}
              {css.trim() && (
                <style className="builder-style">
                  {(InnerComponent && !isBlock
                    ? `.${this.id} > * { height: 100%; width: 100%; }`
                    : '') + this.css}
                </style>
              )}
            </React.Fragment>
          )
        }}
      </BuilderAsyncRequestsContext.Consumer>
    )
  }

  get id() {
    const { block } = this.props
    if (!block.id.startsWith('builder')) {
      return 'builder-' + block.id
    }
    return block.id
  }

  contents(state: BuilderBlocksState) {
    const { block } = this.props

    // this.setState(state);
    this.privateState = state

    if (block.repeat && block.repeat.collection) {
      const collectionPath = block.repeat.collection
      const collectionName = last((collectionPath || '').trim().split('.'))
      const itemName = block.repeat.itemName || (collectionName ? collectionName + 'Item' : 'item')
      const array = get(state.state, collectionPath)
      if (isArray(array)) {
        return array.map((data, index) => {
          // TODO: Builder state produce the data
          const childState = {
            ...state.state,
            $index: index,
            $item: data,
            [itemName]: data
          }

          return (
            <BuilderStoreContext.Provider
              key={index}
              value={{ ...state, state: childState } as any}
            >
              {this.getElement(index, childState)}
            </BuilderStoreContext.Provider>
          )
        })
      }
      return null
    }

    return this.getElement()
  }

  render() {
    return (
      <BuilderStoreContext.Consumer>{value => this.contents(value)}</BuilderStoreContext.Consumer>
    )
  }
}
