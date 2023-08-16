import ContentVariants from '../../components/content-variants/content-variants';

import { BuilderContent } from '../../types/builder-content';

import {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from '../../types/builder-props';

import { Nullable } from '../../types/typescript';

import { filterAttrs, setAttrs } from '../helpers';

import { fetchSymbolContent } from './symbol.helpers';

import {
  Fragment,
  component$,
  h,
  useComputed$,
  useStore,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik';

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
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
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface SymbolProps extends BuilderComponentsProp {
  symbol?: SymbolInfo;
  dataOnly?: boolean;
  dynamic?: boolean;
  attributes?: any;
  inheritState?: boolean;
}
export const setContent = function setContent(props, state) {
  if (state.contentToUse) return;
  fetchSymbolContent({
    symbol: props.symbol,
    builderContextValue: props.builderContext,
  }).then((newContent) => {
    if (newContent) {
      state.contentToUse = newContent;
    }
  });
};
export const Symbol = component$((props: PropsWithBuilderData<SymbolProps>) => {
  const className = useComputed$(() => {
    return [
      ...[props.attributes.class],
      'builder-symbol',
      props.symbol?.inline ? 'builder-inline-symbol' : undefined,
      props.symbol?.dynamic || props.dynamic
        ? 'builder-dynamic-symbol'
        : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  });
  const state = useStore<any>({ contentToUse: props.symbol?.content });
  useVisibleTask$(() => {
    setContent(props, state);
  });
  useTask$(({ track }) => {
    track(() => props.symbol);
    setContent(props, state);
  });

  return (
    <div {...{}} {...props.attributes} {...{}} class={className.value}>
      <ContentVariants
        apiVersion={props.builderContext.apiVersion}
        apiKey={props.builderContext.apiKey!}
        context={props.builderContext.context}
        customComponents={Object.values(props.builderComponents)}
        data={{
          ...props.symbol?.data,
          ...props.builderContext.localState,
          ...state.contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={state.contentToUse}
      ></ContentVariants>
    </div>
  );
});

export default Symbol;
