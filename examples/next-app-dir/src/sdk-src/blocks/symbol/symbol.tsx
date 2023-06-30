'use client'
import * as React from 'react'
import { useState, useContext, useEffect } from 'react'

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
  builderBlock?: BuilderBlock
  attributes?: any
  inheritState?: boolean
}

import RenderContent from '../../components/render-content/render-content'
import BuilderContext from '../../context/builder.context'
import { getContent } from '../../functions/get-content/index'
import type { BuilderContent } from '../../types/builder-content'
import type { BuilderBlock } from '../../types/builder-block'
import { TARGET } from '../../constants/target'
import { logger } from '../../helpers/logger'

function Symbol(props: SymbolProps) {
  const [className, setClassName] = useState(() =>
    [
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
  )

  const [contentToUse, setContentToUse] = useState(() => props.symbol?.content)

  function fetchContent() {
    /**
     * If:
     * - we have a symbol prop
     * - yet it does not have any content
     * - and we have not already stored content from before
     * - and it has a model name
     *
     * then we want to re-fetch the symbol content.
     */
    if (
      !contentToUse &&
      props.symbol?.model &&
      // This is a hack, we should not need to check for this, but it is needed for Svelte.
      builderContext?.apiKey
    ) {
      getContent({
        model: props.symbol.model,
        apiKey: builderContext.apiKey,
        apiVersion: builderContext.apiVersion,
        query: {
          id: props.symbol.entry,
        },
      })
        .then((response) => {
          if (response) {
            setContentToUse(response)
          }
        })
        .catch((err) => {
          logger.error('Could not fetch symbol content: ', err)
        })
    }
  }

  const builderContext = useContext(BuilderContext)

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    fetchContent()
  }, [props.symbol])

  return (
    <div {...props.attributes} className={className}>
      <RenderContent
        apiVersion={builderContext.apiVersion}
        apiKey={builderContext.apiKey!}
        context={builderContext.context}
        customComponents={Object.values(builderContext.registeredComponents)}
        data={{
          ...props.symbol?.data,
          ...builderContext.localState,
          ...contentToUse?.data?.state,
        }}
        model={props.symbol?.model}
        content={contentToUse}
      />
    </div>
  )
}

export default Symbol
