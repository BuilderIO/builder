import * as React from 'react'

type ComponentOptions = {
  [index: string]: any
  attributes?: {
    [index: string]: any
  }
  builderBlock: BuilderBlock
  builderContext: BuilderContextInterface
}
export interface RenderComponentProps {
  componentRef: any
  componentOptions: ComponentOptions
  blockChildren: BuilderBlock[]
  context: BuilderContextInterface
  components: Dictionary<RegisteredComponent>
}

import type { BuilderBlock } from '../../types/builder-block'
import BlockStyles from './block-styles'
import RenderBlock from './render-block'
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/types'
import { Dictionary } from '@/sdk-src/types/typescript'

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
                components={props.components}
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
