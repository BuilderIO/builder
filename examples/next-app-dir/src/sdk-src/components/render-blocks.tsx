'use client'
import * as React from 'react'
import { useContext } from 'react'

export type RenderBlockProps = {
  blocks?: BuilderBlock[]
  parent?: string
  path?: string
  styleProp?: Record<string, any>
}
import BuilderContext from '../context/builder.context'
import { isEditing } from '../functions/is-editing'
import type { BuilderBlock } from '../types/builder-block'
import BlockStyles from './render-block/block-styles'
import RenderBlock from './render-block/render-block'

function RenderBlocks(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext)

  const blocks = props.blocks || builderContext.content?.data?.blocks

  function className() {
    return 'builder-blocks' + (!blocks?.length ? ' no-blocks' : '')
  }

  function onClick() {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.clickEmptyBlocks',
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        '*'
      )
    }
  }

  function onMouseEnter() {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        {
          type: 'builder.hoverEmptyBlocks',
          data: {
            parentElementId: props.parent,
            dataPath: props.path,
          },
        },
        '*'
      )
    }
  }

  return (
    <>
      <div
        className={className() + ' div-6dd9939e'}
        builder-path={props.path}
        builder-parent-id={props.parent}
        style={props.styleProp}
        onClick={(event) => onClick()}
        onMouseEnter={(event) => onMouseEnter()}
        onKeyPress={(event) => onClick()}
      >
        {blocks ? (
          <>
            {blocks?.map((block) => (
              <RenderBlock
                key={'render-block-' + block.id}
                block={block}
                context={builderContext}
              />
            ))}
          </>
        ) : null}

        {blocks ? (
          <>
            {blocks?.map((block) => (
              <BlockStyles
                key={'block-style-' + block.id}
                block={block}
                context={builderContext}
              />
            ))}
          </>
        ) : null}
      </div>

      <style>{`.div-6dd9939e {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  )
}

export default RenderBlocks
