import * as React from 'react'

export interface SymbolInfo {
  model?: string
  entry?: string
  data?: any
  content?: BuilderContent
  inline?: boolean
  dynamic?: boolean
}
export interface SymbolProps {
  symbol?: SymbolInfo
  dataOnly?: boolean
  dynamic?: boolean
  attributes?: any
  inheritState?: boolean
  builderComponents: Dictionary<RegisteredComponent>
}

import RenderContent from '../../components/render-content/render-content'
import { getContent } from '../../functions/get-content/index'
import type { BuilderContent } from '../../types/builder-content'
import { TARGET } from '../../constants/target'
import { PropsWithBuilder } from '@/sdk-src/types/builder-props'
import { Dictionary } from '@/sdk-src/types/typescript'
import { RegisteredComponent } from '@/sdk-src/context/types'

async function Symbol(props: PropsWithBuilder<SymbolProps>) {
  const className = [
    ...(TARGET === 'vue2' || TARGET === 'vue3'
      ? Object.keys(props.attributes.class)
      : [props.attributes.class]),
    'builder-symbol',
    props.symbol?.inline ? 'builder-inline-symbol' : undefined,
    props.symbol?.dynamic || props.dynamic
      ? 'builder-dynamic-symbol'
      : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const contentToUse = !props.symbol
    ? undefined
    : props.symbol.content ||
      (await getContent({
        model: props.symbol.model!,
        apiKey: props.builderContext.apiKey!,
        apiVersion: props.builderContext.apiVersion,
        query: {
          id: props.symbol.entry,
        },
      }))

  return (
    <div {...props.attributes} className={className}>
      <RenderContent
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
  )
}

export default Symbol
