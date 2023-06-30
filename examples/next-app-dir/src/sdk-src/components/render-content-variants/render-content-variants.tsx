import * as React from 'react'

type VariantsProviderProps = RenderContentProps
import {
  checkShouldRunVariants,
  getVariants,
  getVariantsScriptString,
} from './helpers'
import RenderContent from '../render-content/render-content'
import type { RenderContentProps } from '../render-content/render-content.types'
import { getDefaultCanTrack } from '../../helpers/canTrack'
import RenderInlinedStyles from '../render-inlined-styles'
import { handleABTestingSync } from '../../helpers/ab-tests'

function RenderContentVariants(props: VariantsProviderProps) {
  const variantScriptStr = getVariantsScriptString(
    getVariants(props.content).map((value) => ({
      id: value.id!,
      testRatio: value.testRatio,
    })),
    props.content?.id || ''
  )

  const shouldRenderVariants = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(props.canTrack),
    content: props.content,
  })

  const hideVariantsStyleString = getVariants(props.content)
    .map((value) => `.variant-${value.id} { display: none; } `)
    .join('')

  const contentToRender = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(props.canTrack),
    content: props.content,
  })
    ? props.content
    : handleABTestingSync({
        item: props.content,
        canTrack: getDefaultCanTrack(props.canTrack),
      })

  return (
    <>
      {shouldRenderVariants ? (
        <>
          <RenderInlinedStyles
            id={`variants-styles-${props.content?.id}`}
            styles={hideVariantsStyleString}
          />
          <script
            id={`variants-script-${props.content?.id}`}
            dangerouslySetInnerHTML={{ __html: variantScriptStr }}
          />
          {getVariants(props.content)?.map((variant) => (
            <RenderContent
              key={variant.id}
              content={variant}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              canTrack={props.canTrack}
              customComponents={props.customComponents}
              hideContent={true}
              parentContentId={props.content?.id}
              isSsrAbTest={shouldRenderVariants}
            />
          ))}
        </>
      ) : null}

      <RenderContent
        model={props.model}
        content={contentToRender}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        canTrack={props.canTrack}
        customComponents={props.customComponents}
        classNameProp={`variant-${props.content?.id}`}
        parentContentId={props.content?.id}
        isSsrAbTest={shouldRenderVariants}
      />
    </>
  )
}

export default RenderContentVariants
