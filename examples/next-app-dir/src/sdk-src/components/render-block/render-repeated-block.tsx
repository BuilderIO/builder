'use client'
import * as React from 'react'
import { useState, useContext } from 'react'

type Props = {
  block: BuilderBlock
  repeatContext: BuilderContextInterface
}
import BuilderContext from '../../context/builder.context.js'
import type { BuilderContextInterface } from '../../context/types.js'
import type { BuilderBlock } from '../../types/builder-block'
import RenderBlock from './render-block'

function RenderRepeatedBlock(props: Props) {
  const [store, setStore] = useState(() => props.repeatContext)

  return (
    <BuilderContext.Provider value={store}>
      <RenderBlock block={props.block} context={store} />
    </BuilderContext.Provider>
  )
}

export default RenderRepeatedBlock
