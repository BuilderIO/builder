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
import kebabCase from 'lodash-es/kebabCase'
import { BuilderAsyncRequestsContext, RequestOrPromise } from '../store/builder-async-requests'

// TODO: pull from builer internal utils
const fastClone = (obj: object) => JSON.parse(JSON.stringify(obj))

// TODO: share these types in shared
type ElementType = any

interface StringMap {
  [key: string]: string | undefined | null
}
function mapToCss(map: StringMap, spaces = 2) {
  return reduce(
    map,
    (memo, value, key) => {
      return (
        memo + (value && value.trim() ? `\n${' '.repeat(spaces)}${kebabCase(key)}: ${value};` : '')
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
    update: () => {}
  }

  // TODO: handle adding return if none provided
  stringToFunction(str: string) {
    // FIXME: gross hack
    const useReturn = !(str.includes(';') || str.includes(' return '))
    let fn: Function = () => {}
    try {
      // tslint:disable-next-line:no-function-constructor-with-string-args
      if (Builder.isBrowser) {
        fn = new Function(
          'state',
          'event',
          'block',
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
      console.warn('Function compile error', error)
    }

    return (...args: any[]) => {
      try {
        if (Builder.isBrowser) {
          return fn(...args)
        } else {
          // TODO: cache these for better performancs with new VmScript
          // const { VM } = require('vm2')
          // const [state, event] = args
          // return new VM({
          //   timeout: 100,
          //   sandbox: {
          //     ...state,
          //     ...{ state },
          //     event
          //   }
          // }).run(str)
        }
      } catch (error) {
        console.warn('Eval error', error)
        if (this._errors) {
          this._errors.push(error)
        }
      }
    }
  }

  get styles() {
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
    const self = this.props.block

    const baseStyles: Partial<CSSStyleDeclaration> = {
      ...(self.responsiveStyles && self.responsiveStyles.large)
    }

    let css = `.builder-block.${self.id} {${mapToCss(baseStyles as StringMap)}}`

    const reversedNames = sizeNames.slice().reverse()
    if (self.responsiveStyles) {
      for (const size of reversedNames) {
        if (
          size !== 'large' &&
          size !== 'xsmall' &&
          self.responsiveStyles[size] &&
          Object.keys(self.responsiveStyles[size]).length
        ) {
          css += `\n@media (max-width: ${sizes[size].max}px) { \n.builder-block.${
            self.id
          } {${mapToCss(self.responsiveStyles[size], 4)} } }`
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
    if (block.bindings) {
      for (const key in block.bindings) {
        const value = this.stringToFunction(block.bindings[key])
        set(options, key, value(state, null, block))
      }
    }

    if (block.actions) {
      for (const key in block.actions) {
        const value = block.actions[key]
        options['on' + capitalize(key)] = (event: any) => {
          // TODO: pass in store
          const fn = this.stringToFunction(value)
          this.privateState.update((state: any) => {
            return fn(state, event)
          })
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

    const noWrap = componentInfo && (componentInfo as any).fragment

    const finalOptions = {
      ...omit(options, 'class'),
      class:
        `builder-block ${this.id}${block.class ? ` ${block.class}` : ''}${
          block.component && !includes(['Image', 'Video', 'Banner'], componentName)
            ? ` builder-has-component`
            : ''
        }` + (options.class ? ' ' + options.class : ''),
      key: this.id + index,
      'builder-id': this.id
    }

    if (
      (((finalOptions as any).properties && (finalOptions as any).properties.href) ||
        (finalOptions as any).href) &&
      TagName === 'div'
    ) {
      TagName = 'a'
    }

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
              ) : InnerComponent && noWrap ? (
                // TODO: pass the class to be easier
                <InnerComponent {...finalOptions} builderBlock={block} />
              ) : (
                <TagName {...finalOptions}>
                  <React.Fragment>
                    {InnerComponent && (
                      <InnerComponent builderBlock={block} {...innerComponentProperties} />
                    )}
                    {block.text || options.text ? (
                      // TODO: remove me! No longer in use (maybe with rich text will be back tho)
                      <TextTag dangerouslySetInnerHTML={{ __html: options.text || block.text }} />
                    ) : block.children && block.children.length ? (
                      block.children.map((block: ElementType, index: number) => (
                        <BuilderBlock
                          key={((this.id as string) || '') + index}
                          block={block}
                          index={index}
                          size={this.props.size}
                          fieldName={this.props.fieldName}
                          child={this.props.child}
                        />
                      ))
                    ) : null}
                  </React.Fragment>
                </TagName>
              )}
              <style className="builder-style">
                {(InnerComponent && !isBlock
                  ? `.${this.id} > * { height: 100%; width: 100%; }`
                  : '') + this.css}
              </style>
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
            <BuilderStoreContext.Provider value={{ ...state, state: childState } as any}>
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
