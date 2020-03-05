/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { BuilderPage } from '../components/builder-page.component'
import { Builder, BuilderElement } from '@builder.io/sdk'
import hash from 'hash-sum'
import { NoWrap } from '../components/no-wrap'
import { BuilderStoreContext } from '../store/builder-store'
import { withBuilder } from '../functions/with-builder'

const size = (thing: object) => Object.keys(thing).length

export interface SymbolInfo {
  model?: string
  entry?: string
  data?: any
  content?: any
  inline?: boolean
  dynamic?: boolean
}

export interface SymbolProps {
  symbol?: SymbolInfo
  dataOnly?: boolean
  builderBlock?: BuilderElement
  attributes?: any
}

class SymbolComponent extends React.Component<SymbolProps> {
  ref: BuilderPage | null = null

  get placeholder() {
    return (
      <div css={{ padding: 10 }}>
        Symbols let you reuse dynamic elements across your content. Please
        choose a model and entry for this symbol.
      </div>
    )
  }

  shouldComponentUpdate(nextProps: any) {
    if (Builder.isEditing) {
      // TODO: maybe don't do this for editor perf of symbols with lots of
      // data
      if (hash(nextProps) === hash(this.props)) {
        return false
      }
    }
    return true
  }

  render() {
    const symbol = this.props.symbol

    let showPlaceholder = false

    if (!symbol) {
      showPlaceholder = true
    }

    const TagName = this.props.dataOnly
      ? NoWrap
      : (this.props.builderBlock && this.props.builderBlock.tagName) || 'div'

    const { model, entry, data, content, inline, dynamic } = symbol || {}
    if (!(model && (entry || dynamic)) && !inline) {
      showPlaceholder = true
    }

    let key = dynamic ? undefined : [model, entry].join(':')
    const dataString = Builder.isEditing
      ? null
      : data && size(data) && hash(data)

    if (key && dataString && dataString.length < 300) {
      key += ':' + dataString
    }

    const attributes = this.props.attributes || {}
    return (
      <BuilderStoreContext.Consumer
        key={(model || 'no model') + ':' + (entry || 'no entry')}
      >
        {state => {
          return (
            <TagName
              data-model={model}
              {...attributes}
              className={
                (attributes.class || attributes.className || '') +
                ' builder-symbol' +
                (symbol?.inline ? ' builder-inline-symbol' : '') +
                (symbol?.dynamic ? ' builder-dynamic-symbol' : '')
              }
            >
              {showPlaceholder ? (
                this.placeholder
              ) : (
                <BuilderPage
                  ref={ref => (this.ref = ref)}
                  context={{ ...state.context }}
                  modelName={model}
                  entry={entry}
                  data={data}
                  inlineContent={symbol?.inline}
                  content={content}
                  options={{ key }}
                  hydrate={state.state?._hydrate}
                  builderBlock={this.props.builderBlock}
                  dataOnly={this.props.dataOnly}
                >
                  {/* TODO: builder blocks option for loading stuff */}
                  {this.props.children}
                </BuilderPage>
              )}
            </TagName>
          )
        }}
      </BuilderStoreContext.Consumer>
    )
  }
}

export const Symbol = withBuilder(SymbolComponent, {
  // Builder:Symbol
  name: 'Symbol',
  noWrap: true,
  static: true,
  // TODO: allow getter for icon so different icon if data symbol hm,
  // Maybe "this" context is the block element in editor, and it's the
  // builderBlock json otherwise. In BuilderBlock decorator find any getters
  // and convert to strings when passing and convert back to getters after
  // with `this` bound
  inputs: [
    {
      name: 'symbol',
      type: 'uiSymbol'
    },
    {
      name: 'dataOnly',
      helperText: `Make this a data symbol that doesn't display any UI`,
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true
    }
  ]
})
