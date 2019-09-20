import React from 'react'
import { Builder, Component, BuilderElement, builder } from '@builder.io/sdk'
import { sizeNames, Size, sizes } from '../constants/device-sizes.constant'
import { BuilderStoreContext } from '../store/builder-store'
import { BuilderAsyncRequestsContext, RequestOrPromise } from '../store/builder-async-requests'
import { stringToFunction, api } from '../functions/string-to-function'
import { set } from '../functions/set'

const camelCaseToKebabCase = (str?: string) =>
  str ? str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`) : ''

const Device = { desktop: 0, tablet: 1, mobile: 2 }

const commonTags = new Set(['div', 'a', 'span'])
const voidElements = new Set([
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
])

function pick(object: any, keys: string[]) {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      ;(obj as any)[key] = object[key]
    }
    return obj
  }, {})
}

const last = <T extends any>(arr: T[]) => arr[arr.length - 1]

function omit(obj: any, values: string[]) {
  const newObject = Object.assign({}, obj)
  for (const key of values) {
    delete (newObject as any)[key]
  }
  return newObject
}

const cssCase = (property: string) => {
  if (!property) {
    return property
  }

  let str = camelCaseToKebabCase(property)

  if (property[0] === property[0].toUpperCase()) {
    str = '-' + str
  }

  return str
}

// TODO: pull from builer internal utils
const fastClone = (obj: object) => JSON.parse(JSON.stringify(obj))

// TODO: share these types in shared
type ElementType = any

interface StringMap {
  [key: string]: string | undefined | null
}
function mapToCss(map: StringMap, spaces = 2, important = false) {
  return Object.keys(map).reduce((memo, key) => {
    const value = map[key]
    if (typeof value !== 'string') {
      return memo
    }
    return (
      memo +
      (value && value.trim()
        ? `\n${' '.repeat(spaces)}${cssCase(key)}: ${value + (important ? ' !important' : '')};`
        : '')
    )
  }, '')
}

export interface BuilderBlockProps {
  fieldName?: string
  block: BuilderElement
  // TODO:
  // block: BuilderElement
  child?: boolean
  index?: number
  size?: Size
  emailMode?: boolean
  // TODO: use context
  ampMode?: boolean
}

function capitalize(str: string) {
  if (!str) {
    return
  }
  return str[0].toUpperCase() + str.slice(1)
}

interface BuilderBlocksState {
  state: any
  rootState: any
  update: Function
}

export class BuilderBlock extends React.Component<BuilderBlockProps> {
  private ref: any
  private _asyncRequests?: RequestOrPromise[]
  private _errors?: Error[]
  private _logs?: string[]

  private privateState: BuilderBlocksState = {
    state: {},
    rootState: {},
    update: () => {
      /* Intentionally empty */
    }
  }

  // TODO: handle adding return if none provided
  // TODO: cache/memoize this (globally with LRU?)
  stringToFunction(str: string, expression = true) {
    return stringToFunction(str, expression, this._errors, this._logs)
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
          Object.keys(self.responsiveStyles[size]!).length
        ) {
          const emailOuterSizes = ['display', 'width', 'verticalAlign']
          const map = self.responsiveStyles[size]
          const outer = this.props.emailMode && pick(map, emailOuterSizes)
          // TODO: this will not work as expected for a couple things that are handled specially,
          // e.g. width
          css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n${
            this.props.emailMode ? '.' : '.builder-block.'
          }${self.id + (this.props.emailMode ? '-subject' : '')} {${mapToCss(
            this.props.emailMode ? omit(map, emailOuterSizes) : (map as any),
            4,
            this.props.emailMode
          )} } }`

          if (this.props.emailMode && outer && Object.keys(outer).length) {
            css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.builder-block.${
              self.id
            } {${mapToCss(outer as any, 4, true)} } }`
          }
        }
      }
    }

    const animations = self.animations
    if (!Builder.isBrowser && animations && animations.length) {
      const firstAnimation = animations[0]
      if (firstAnimation) {
        const firstStep = firstAnimation.steps && firstAnimation.steps[0]
        if (firstStep) {
          const firstStepStyles = firstStep.styles
          if (firstStepStyles) {
            css += `\n.builder-block.${self.id} {${mapToCss(firstStep, 2, true)}}`
          }
        }
      }
    }

    return css
  }

  componentDidMount() {
    const { block } = this.props
    const animations = block && block.animations

    // tslint:disable-next-line:comment-format
    ///REACT15ONLY if (this.ref) { this.ref.setAttribute('builder-id', block.id); }

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
            // TODO: this needs to run in getElement bc of local state per element for repeats
            const value = this.stringToFunction(block.bindings[key])
            if (value !== undefined) {
              set(options, key, value(this.privateState.state, null, block, builder, null, null, Builder))
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
    const componentName =
      block.component && (block.component.name || (block.component as any).component)
    let componentInfo: Component | null = null
    if (block.component && !(block.component as any).class) {
      if (block.component && block.component.tag) {
        InnerComponent = block.component.tag
      } else {
        componentInfo = Builder.components.find(item => item.name === componentName) || null
        if (componentInfo && componentInfo.class) {
          InnerComponent = componentInfo.class
        } else if (componentInfo && componentInfo.tag) {
          InnerComponent = componentInfo.tag
        }
      }
    }

    const TextTag: any = 'span'

    const isBlock = !['absolute', 'fixed'].includes(
      block.responsiveStyles &&
        block.responsiveStyles.large &&
        (block.responsiveStyles.large.position as any) /*( this.styles.position */
    )

    let options: any = {
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
        // TODO: pass block, etc
        set(options, key, value(state, null, block, api(state), Device, null, Builder))
      }
    }

    if (options.hide) {
      return null
    }
    // TODO: UI for this
    if (('show' in options || (block.bindings && block.bindings.show)) && !options.show) {
      return null
    }

    if (block.actions) {
      for (const key in block.actions) {
        const value = block.actions[key]
        options['on' + capitalize(key)] = (event: any) => {
          let useState = state
          if (typeof Proxy !== 'undefined') {
            useState = new Proxy(state, {
              set: (obj, prop, value) => {
                obj[prop] = value
                this.privateState.rootState[prop] = value
                return true
              }
            })
          }
          const fn = this.stringToFunction(value, false)
          // TODO: only one root instance of this, don't rewrap every time...
          return fn(useState, event, undefined, api(useState), Device, this.privateState.update, Builder)
        }
      }
    }

    const innerComponentProperties = (options.component || options.options) && {
      ...options.options,
      ...(options.component.options || options.component.data)
    }

    const isVoid = voidElements.has(TagName)

    const noWrap = componentInfo && (componentInfo.fragment || componentInfo.noWrap)

    const finalOptions: { [key: string]: string } = {
      ...omit(options, ['class', 'component']),
      [commonTags.has(TagName) ? 'className' : 'class']:
        `builder-block ${this.id}${block.class ? ` ${block.class}` : ''}${
          block.component && !['Image', 'Video', 'Banner'].includes(componentName)
            ? ` builder-has-component`
            : ''
        }` + (options.class ? ' ' + options.class : ''),
      key: this.id + index,
      'builder-id': this.id,
      ref: ((ref: any) => (this.ref = ref)) as any,
      // ...(state && state.$index && typeof state.$index === 'number'
      //   ? {
      // TODO: ONLY include on repeat!
      // TODO: what if dymically repeated by another component like tabs... may not work.
      // need function to provide that right
      ...(index !== 0 && {
        'builder-index': index // String(state.$index)
      })
      //   }
      // : null)
    }

    // tslint:disable-next-line:comment-format
    ///REACT15ONLY finalOptions.className = finalOptions.class

    if (Builder.isIframe) {
      ;(finalOptions as any)['builder-inline-styles'] = !options.style
        ? ''
        : Object.keys(options.style).reduce(
            (memo, key) => (memo ? `${memo};` : '') + `${cssCase(key)}:${options.style[key]};`,
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

    const styleTag = css.trim() && (
      <style className="builder-style">
        {(InnerComponent && !isBlock ? `.${this.id} > * { height: 100%; width: 100%; }` : '') +
          this.css}
      </style>
    )

    const children = block.children || finalOptions.children || []

    // TODO: test it out
    return (
      <BuilderAsyncRequestsContext.Consumer>
        {value => {
          this._asyncRequests = value && value.requests
          this._errors = value && value.errors
          this._logs = value && value.logs
          return isVoid ? (
            <React.Fragment>
              {styleTag}
              <TagName {...finalOptions} />
            </React.Fragment>
          ) : InnerComponent && (noWrap || this.props.emailMode) ? (
            // TODO: pass the class to be easier
            // TODO: acceptsChildren option?
            <React.Fragment>
              {styleTag}
              <InnerComponent
                // Final options maaay be wrong here hm
                {...innerComponentProperties}
                attributes={finalOptions}
                builderBlock={block}
              />
            </React.Fragment>
          ) : (
            <TagName {...finalOptions as any}>
              {styleTag}
              {InnerComponent && (
                <InnerComponent builderBlock={block} {...innerComponentProperties} />
              )}
              {(block as any).text || options.text ? (
                // TODO: remove me! No longer in use (maybe with rich text will be back tho)
                <TextTag
                  dangerouslySetInnerHTML={{ __html: options.text || (block as any).text }}
                />
              ) : !InnerComponent && children && Array.isArray(children) && children.length ? (
                children.map((block: ElementType, index: number) => (
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
            </TagName>
          )
        }}
      </BuilderAsyncRequestsContext.Consumer>
    )
  }

  get id() {
    const { block } = this.props
    if (!block.id!.startsWith('builder')) {
      return 'builder-' + block.id
    }
    return block.id!
  }

  contents(state: BuilderBlocksState) {
    const { block } = this.props

    // this.setState(state);
    this.privateState = state

    if (block.repeat && block.repeat.collection) {
      const collectionPath = block.repeat.collection
      const collectionName = last(
        (collectionPath || '')
          .trim()
          .split('(')[0]
          .trim()
          .split('.')
      )
      const itemName = block.repeat.itemName || (collectionName ? collectionName + 'Item' : 'item')
      const array = this.stringToFunction(collectionPath)(
        state.state,
        null,
        block,
        api(state),
        Device
      )
      if (Array.isArray(array)) {
        return array.map((data, index) => {
          // TODO: Builder state produce the data
          const childState = {
            ...state.state,
            $index: index,
            $item: data,
            [itemName]: data,
            [`$${itemName}Index`]: index
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
