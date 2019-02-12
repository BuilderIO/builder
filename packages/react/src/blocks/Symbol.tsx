import React from 'react'
import { BuilderPage } from '../components/builder-page.component';
import { BuilderBlock } from '../decorators/builder-block.decorator';

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
        <BuilderPage
          modelName={symbol.model}
          entry={symbol.entry}
          data={symbol.data}
          content={symbol.content}
        />
      </div>
    )
  }
}
