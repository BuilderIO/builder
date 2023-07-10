'use client'

import { TARGET } from '@/sdk-src/constants/target'
import { BuilderContextInterface } from '@/sdk-src/context/types'
import { getBlockActions } from '@/sdk-src/functions/get-block-actions'
import { getBlockProperties } from '@/sdk-src/functions/get-block-properties'
import { getReactNativeBlockStyles } from '@/sdk-src/functions/get-react-native-block-styles'
import { BuilderBlock } from '@/sdk-src/types/builder-block'
import { PropsWithChildren } from 'react'

export type RenderBlockProps = {
  Wrapper: string
  block: BuilderBlock
  context: BuilderContextInterface
  wrapperProps?: any
}

function RenderBlockWrapper(props: PropsWithChildren<RenderBlockProps>) {
  function actions() {
    return getBlockActions({
      block: props.block,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      localState: props.context.localState,
      context: props.context.context,
    })
  }

  function attributes() {
    const blockProperties = getBlockProperties(props.block)
    return {
      ...blockProperties,
      ...(TARGET === 'reactNative'
        ? {
            style: getReactNativeBlockStyles({
              block: props.block,
              context: props.context,
              blockStyles: blockProperties.style,
            }),
          }
        : {}),
    }
  }

  return (
    <props.Wrapper {...props.wrapperProps} {...attributes()} {...actions()}>
      {props.children}
    </props.Wrapper>
  )
}

export default RenderBlockWrapper
