import React from 'react'
import { BuilderBlock, BuilderComponent } from '@builder.io/react'

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
  render() {
    const symbol = this.props.symbol

    if (!symbol) {
      return null
    }
    return (
      <div className="builder-symbol">
        {/* TODO: ab test variant? // TODO: will this bif on multiple of same type? */}
        <BuilderComponent
          modelName={symbol.model}
          entry={symbol.entry}
          data={symbol.data}
          content={symbol.content}
        />
      </div>
    )
  }
}
