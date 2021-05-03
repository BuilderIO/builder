/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { BuilderComponent } from '../components/builder-component.component';
import { Builder, BuilderElement } from '@builder.io/sdk';
import hash from 'hash-sum';
import { NoWrap } from '../components/no-wrap';
import { BuilderStoreContext } from '../store/builder-store';
import { withBuilder } from '../functions/with-builder';

const size = (thing: object) => Object.keys(thing).length;

const isShopify = Builder.isBrowser && 'Shopify' in window;

const refs: Record<string, Element> = {};

if (Builder.isBrowser) {
  try {
    Array.from(document.querySelectorAll('[builder-static-symbol]')).forEach(el => {
      const id = (el as HTMLDivElement).getAttribute('builder-static-symbol');
      if (id) {
        refs[id] = el;
      }
    });
  } catch (err) {
    console.error('Builder replace nodes error:', err);
  }
}

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: any;
  inline?: boolean;
  dynamic?: boolean;
}

export interface SymbolProps {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  builderBlock?: BuilderElement;
  attributes?: any;
  inheritState?: boolean;
}

class SymbolComponent extends React.Component<SymbolProps> {
  ref: BuilderComponent | null = null;
  staticRef: HTMLDivElement | null = null;

  get placeholder() {
    return (
      <div css={{ padding: 10 }}>
        Symbols let you reuse dynamic elements across your content. Please choose a model and entry
        for this symbol.
      </div>
    );
  }

  componentDidMount() {
    if (this.useStatic && this.staticRef && refs[this.props.builderBlock?.id!]) {
      this.staticRef.parentNode?.replaceChild(refs[this.props.builderBlock?.id!], this.staticRef);
    }
  }

  get useStatic() {
    return Boolean(
      Builder.isBrowser &&
        refs[this.props.builderBlock?.id!] &&
        !(Builder.isEditing || Builder.isPreviewing)
    );
  }

  render() {
    if (this.useStatic) {
      return <div ref={el => (this.staticRef = el)} />;
    }

    const symbol = this.props.symbol;

    let showPlaceholder = false;

    if (!symbol) {
      showPlaceholder = true;
    }

    const TagName = this.props.dataOnly
      ? NoWrap
      : (this.props.builderBlock && this.props.builderBlock.tagName) || 'div';

    const { model, entry, data, content, inline } = symbol || {};
    const dynamic = symbol?.dynamic || this.props.dynamic;
    if (!(model && (entry || dynamic)) && !content?.data?.blocksJs && !inline) {
      showPlaceholder = true;
    }

    let key = dynamic ? undefined : [model, entry].join(':');
    const dataString = Builder.isEditing ? null : data && size(data) && hash(data);

    if (key && dataString && dataString.length < 300) {
      key += ':' + dataString;
    }

    const attributes = this.props.attributes || {};
    return (
      <BuilderStoreContext.Consumer key={(model || 'no model') + ':' + (entry || 'no entry')}>
        {state => {
          return (
            <TagName
              data-model={model}
              {...attributes}
              className={
                (attributes.class || attributes.className || '') +
                ' builder-symbol' +
                (symbol?.inline ? ' builder-inline-symbol' : '') +
                (symbol?.dynamic || this.props.dynamic ? ' builder-dynamic-symbol' : '')
              }
            >
              {showPlaceholder ? (
                this.placeholder
              ) : (
                <BuilderComponent
                  isChild
                  ref={(ref: any) => (this.ref = ref)}
                  context={{ ...state.context, symbolId: this.props.builderBlock?.id }}
                  modelName={model}
                  entry={entry}
                  data={{
                    ...data,
                    ...(!!this.props.inheritState && state.state),
                    ...this.props.builderBlock?.component?.options?.symbol?.content?.data?.state,
                  }}
                  renderLink={state.renderLink}
                  inlineContent={symbol?.inline}
                  {...(content && { content })}
                  options={{ key, noEditorUpdates: true }}
                  codegen={!!content?.data?.blocksJs}
                  hydrate={state.state?._hydrate}
                  builderBlock={this.props.builderBlock}
                  dataOnly={this.props.dataOnly}
                >
                  {/* TODO: builder blocks option for loading stuff */}
                  {this.props.children}
                </BuilderComponent>
              )}
            </TagName>
          );
        }}
      </BuilderStoreContext.Consumer>
    );
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
      type: 'uiSymbol',
    },
    {
      name: 'dataOnly',
      helperText: `Make this a data symbol that doesn't display any UI`,
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'inheritState',
      helperText: `Inherit the parent component state and data`,
      type: 'boolean',
      defaultValue: isShopify,
      advanced: true,
    },
    {
      name: 'renderToLiquid',
      helperText:
        'Render this symbols contents to liquid. Turn off to fetch with javascript and use custom targeting',
      type: 'boolean',
      defaultValue: isShopify,
      advanced: true,
      hideFromUI: true,
    },
    {
      name: 'useChildren',
      hideFromUI: true,
      type: 'boolean',
    },
  ],
});
