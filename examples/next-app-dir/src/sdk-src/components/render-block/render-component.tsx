'use client'
import * as React from 'react'

type ComponentOptions = {
  [index: string]: any
  attributes?: {
    [index: string]: any
  }
}
export interface RenderComponentProps {
  componentRef: any
  componentOptions: ComponentOptions
  blockChildren: BuilderBlock[]
  context: BuilderContextInterface
}

import type { BuilderBlock } from '../../types/builder-block.js'
import BlockStyles from './block-styles'
import RenderBlock from './render-block'
import type { BuilderContextInterface } from '../../context/types.js'

function RenderComponent(props: RenderComponentProps) {
  return (
    <>
      {props.componentRef ? (
        <>
          <props.componentRef {...props.componentOptions}>
            {props.blockChildren?.map((child) => (
              <RenderBlock
                key={'render-block-' + child.id}
                block={child}
                context={props.context}
              />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles
                key={'block-style-' + child.id}
                block={child}
                context={props.context}
              />
            ))}
          </props.componentRef>
        </>
      ) : null}
    </>
  )
}

export default RenderComponent
