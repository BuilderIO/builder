import React from 'react'
import { BuilderPage } from '../components/builder-page.component'
import { BuilderBlock } from '../decorators/builder-block.decorator'
import { Builder, builder, BuilderElement } from '@builder.io/sdk'
import hash from 'hash-sum'
import { NoWrap } from 'src/components/no-wrap'

const size = (thing: object) => Object.keys(thing).length

export interface SymbolInfo {
  model?: string
  entry?: string
  data?: any
  content?: any
  inline?: boolean
}

export interface SymbolProps {
  symbol?: SymbolInfo
  dataOnly?: boolean
  builderBlock?: BuilderElement
  attributes?: any
}

@BuilderBlock({
  // Builder:Symbol
  name: 'Symbol',
  noWrap: true,
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
      defaultValue: false
    }
  ]
})
export class Symbol extends React.Component<SymbolProps> {
  get placeholder() {
    return (
      <div style={{ padding: 10 }}>
        Symbols let you reuse dynamic elements across your content. Please choose a model and entry
        for this symbol.
      </div>
    )
  }

  render() {
    const symbol = this.props.symbol

    if (!symbol) {
      return this.placeholder
    }

    const TagName = this.props.dataOnly
      ? NoWrap
      : (this.props.builderBlock && this.props.builderBlock.tagName) || 'div'

    const { model, entry, data, content, inline } = symbol
    if (!model && !inline) {
      return this.placeholder
    }

    let key = Builder.isEditing && builder.editingModel === model ? undefined : entry
    const dataString = data && size(data) && hash(data)
    if (key && dataString && dataString.length < 300) {
      key += ':' + dataString
    }

    const attributes = this.props.attributes || {}
    return (
      <TagName
        data-model={model}
        {...attributes}
        className={
          (attributes.class || attributes.className || '') +
          ' builder-symbol' +
          (symbol.inline ? ' builder-inline-symbol' : '')
        }
      >
        <BuilderPage
          key={(model || 'no model') + ':' + (entry || 'no entry')}
          modelName={model}
          entry={entry}
          data={data}
          inlineContent={symbol.inline}
          content={content}
          options={{ key }}
          builderBlock={this.props.builderBlock}
          dataOnly={this.props.dataOnly}
        >
          {/* TODO: builder blocks option for loading stuff */}
          {this.props.children}
        </BuilderPage>
      </TagName>
    )
  }
}
