import * as React from 'react'
import { _track } from '../../functions/track/index'
import RenderBlocks from '../render-blocks'
import RenderContentStyles from './components/render-styles'
import type { RenderContentProps } from './render-content.types'
import { TARGET } from '../../constants/target'
import { getRenderContentScriptString } from '../render-content-variants/helpers'
import EnableBuilderEditor from './builder-editor'
import { ComponentInfo } from '@/sdk-src/types/components'
import { getDefaultRegisteredComponents } from '@/sdk-src/constants/builder-registered-components'
import { components } from '@/sdk-src/functions/register-component'
import { RegisteredComponent } from '@/sdk-src/context/types'
import { Dictionary } from '@/sdk-src/types/typescript'
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './render-content.helpers'

function RenderContent(props: RenderContentProps) {
  const scriptStr = getRenderContentScriptString({
    contentId: props.content?.id!,
    parentContentId: props.parentContentId!,
  })

  const { customComponents, ...rest } = props

  const customComps = [
    ...getDefaultRegisteredComponents(),
    // While this `components` object is deprecated, we must maintain support for it.
    // Since users are able to override our default components, we need to make sure that we do not break such
    // existing usage.
    // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
    // which is the new standard way of providing custom components, and must therefore take precedence.
    ...components,
    ...(props.customComponents || []),
  ].reduce<Dictionary<RegisteredComponent>>(
    (acc, info) => ({
      ...acc,
      [info.name]: info,
    }),
    {}
  )

  /**
   * Strip components because they are not serializable when sent as a prop from RSC -> Client component.
   * They are also not needed in the client component, since we only need the component info.
   */
  const customComponentsInfo = Object.values(customComps).reduce<
    Dictionary<ComponentInfo>
  >(
    (acc, { component, ...info }) => ({
      ...acc,
      [info.name]: info,
    }),
    {}
  )

  const builderContextSignal = {
    content: getContentInitialValue({
      content: props.content,
      data: props.data,
    }),
    localState: undefined,
    rootState: getContextStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    }),
    // TO-DO: handle this.
    rootSetState: null,
    context: props.context || {},
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    registeredComponents: customComponentsInfo,
    inheritedStyles: {},
  }

  return (
    <EnableBuilderEditor {...rest} customComponents={customComponentsInfo}>
      {props.isSsrAbTest ? (
        <>
          <script dangerouslySetInnerHTML={{ __html: scriptStr }} />
        </>
      ) : null}

      {TARGET !== 'reactNative' ? (
        <>
          <RenderContentStyles />
        </>
      ) : null}

      <RenderBlocks
        components={customComps}
        blocks={props.content?.data?.blocks}
        context={builderContextSignal}
      />
    </EnableBuilderEditor>
  )
}

export default RenderContent
