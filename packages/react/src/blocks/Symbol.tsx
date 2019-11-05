/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { BuilderPage } from '../components/builder-page.component'
import { BuilderBlock } from '../decorators/builder-block.decorator'
import { Builder, builder, BuilderElement } from '@builder.io/sdk'
import hash from 'hash-sum'
import { NoWrap } from 'src/components/no-wrap'
import { BuilderStoreContext } from 'src/store/builder-store'
import { withBuilder } from 'src/functions/with-builder'

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

function traverse(obj: any, cb: (obj: any, key?: string) => void, key?: string) {
  cb(obj, key)
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      traverse(value, cb)
    })
  }
}

const getAllObjects = (blocks: any[]) => {
  const list: any[] = [];
  blocks.forEach(block => {
    traverse(block, child => {
      if (child && typeof child === 'object') {
        list.push(child)
      }
    })
  })
  return list
}


class SymbolComponent extends React.Component<SymbolProps> {
  get placeholder() {
    return (
      <div css={{ padding: 10 }}>
        Symbols let you reuse dynamic elements across your content. Please choose a model and entry
        for this symbol.
      </div>
    )
  }

  render() {
    const symbol = this.props.symbol

    let showPlaceholder = false;

    if (!symbol) {
      showPlaceholder = true
    }

    const TagName = this.props.dataOnly
      ? NoWrap
      : (this.props.builderBlock && this.props.builderBlock.tagName) || 'div'

    const { model, entry, data, content, inline } = symbol || {}
    if (!model && !inline) {
      showPlaceholder = true
    }

    let key = Builder.isEditing && builder.editingModel === model ? undefined : entry
    const dataString = data && size(data) && hash(data)

    if (key && dataString && dataString.length < 300) {
      key += ':' + dataString
    }

    const attributes = this.props.attributes || {}
    return (
      <BuilderStoreContext.Consumer>
        {state => {
          const { content } = state;
          if (!key && Builder.isEditing && Array.isArray(content?.data?.blocks)) {
            let isNestedSymbol = false;
            // TODO: traverse elements from builder store context and find symbol parents
            const allObjects = getAllObjects(content.data.blocks)
            const getParent = (obj: any) => allObjects.find(item => Object.values(item).includes(obj))
            const obj = allObjects.find(item => item.id === this.props.builderBlock?.id)
            if (obj) {
              let parent = obj
              while (parent = getParent(parent)) {
                if (parent?.component?.name === 'Symbol') {
                  isNestedSymbol = true;
                }
              }
            }
            if (isNestedSymbol) {
              key = entry || 'no-entry'
            }
          }


          return <TagName
            data-model={model}
            {...attributes}
            className={
              (attributes.class || attributes.className || '') +
              ' builder-symbol' +
              (symbol?.inline ? ' builder-inline-symbol' : '')
            }
          >
            {showPlaceholder ? this.placeholder :
            <BuilderPage
              key={(model || 'no model') + ':' + (entry || 'no entry')}
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
            </BuilderPage>}
          </TagName>
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
      advanced: true
    }
  ]
})
