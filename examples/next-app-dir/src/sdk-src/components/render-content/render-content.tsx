import * as React from 'react'
import { _track } from '../../functions/track/index'
import RenderBlocks from '../render-blocks'
import RenderContentStyles from './components/render-styles'
import type { RenderContentProps } from './render-content.types'
import { TARGET } from '../../constants/target'
import { getRenderContentScriptString } from '../render-content-variants/helpers'
import EnableBuilderEditor from './builder-editor'

function RenderContent(props: RenderContentProps) {
  const scriptStr = getRenderContentScriptString({
    contentId: props.content?.id!,
    parentContentId: props.parentContentId!,
  })

  return (
    <EnableBuilderEditor {...props}>
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

      <RenderBlocks />
    </EnableBuilderEditor>
  )
}

export default RenderContent
