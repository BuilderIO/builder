'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface SymbolInfo {
  model?: string;
  entry?: string;
  data?: any;
  content?: BuilderContent;
  inline?: boolean;
  dynamic?: boolean;
}
/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface SymbolProps extends BuilderComponentsProp {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  attributes?: any;
  inheritState?: boolean;
}

import ContentVariants from '../../components/content-variants/content-variants';
import type { BuilderContent } from '../../types/builder-content';
import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from '../../types/builder-props';
import { setAttrs } from '../helpers';
import { fetchSymbolContent } from './symbol.helpers';

function Symbol(props: PropsWithBuilderData<SymbolProps>) {
  function className() {
    return [
      ...[props.attributes.className],
      'builder-symbol',
      props.symbol?.inline ? 'builder-inline-symbol' : undefined,
      props.symbol?.dynamic || props.dynamic
        ? 'builder-dynamic-symbol'
        : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }

  const [contentToUse, setContentToUse] = useState(() => props.symbol?.content);

  function setContent() {
    if (contentToUse) return;
    fetchSymbolContent({
      symbol: props.symbol,
      builderContextValue: props.builderContext,
    }).then((newContent) => {
      if (newContent) {
        setContentToUse(newContent);
      }
    });
  }

  useEffect(() => {}, []);

  useEffect(() => {
    setContent();
  }, [props.symbol]);

  return (
    <div {...{}} {...props.attributes} {...{}} className={className()}>
      <ContentVariants
        __isNestedRender={true}
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey!}
        context={props.builderContext.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse}
      />
    </div>
  );
}

export default Symbol;
