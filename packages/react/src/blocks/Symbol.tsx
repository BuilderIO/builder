import React from 'react'
import { BuilderPage } from '../components/builder-page.component'
import { BuilderBlock } from '../decorators/builder-block.decorator'

export interface SymbolInfo {
  model?: string
  entry?: string
  data?: any
  content?: any
}

export interface SymbolProps {
  symbol?: SymbolInfo
}

@BuilderBlock({
  // Builder:Symbol
  name: 'Symbol',
  inputs: [
    {
      name: 'symbol',
      type: 'uiSymbol'
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

    const { model, entry, data, content } = symbol
    if (!model && entry) {
      return this.placeholder
    }
    return (
      <div className="builder-symbol" data-model={model}>
        <BuilderPage
          modelName={model}
          entry={entry}
          data={data}
          content={content}
          options={{ key: entry }}
        >
        {/* TODO: builder blocks option for loading stuff */}
          {this.props.children}
        </BuilderPage>
      </div>
    )
  }
}
