import React from 'react';
import { BuilderPage } from '../components/builder-page.component';
import { BuilderBlock } from '../decorators/builder-block.decorator';
import { Builder } from '@builder.io/sdk';
import { Text } from 'react-native';

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: any;
  inline?: boolean;
}

export interface SymbolProps {
  symbol?: SymbolInfo;
}

@BuilderBlock({
  // Builder:Symbol
  name: 'Symbol',
  inputs: [
    {
      name: 'symbol',
      type: 'uiSymbol',
    },
  ],
})
export class Symbol extends React.Component<SymbolProps> {
  get placeholder() {
    return (
      <Text style={{ padding: 10 }}>
        Symbols let you reuse dynamic elements across your content. Please choose a model and entry
        for this symbol.
      </Text>
    );
  }

  render() {
    const symbol = this.props.symbol;

    if (!symbol) {
      return this.placeholder;
    }

    const { model, entry, data, content, inline } = symbol;
    if (!model && !inline) {
      return this.placeholder;
    }
    return (
      <BuilderPage
        modelName={model}
        entry={entry}
        data={data}
        inlineContent={symbol.inline}
        content={content}
        options={{ key: Builder.isEditing ? undefined : entry }}
      >
        {/* TODO: builder blocks option for loading stuff */}
        {this.props.children}
      </BuilderPage>
    );
  }
}
