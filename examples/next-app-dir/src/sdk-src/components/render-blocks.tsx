'use client'
import * as React from 'react'
import { useContext } from 'react'

export type RenderBlockProps = {
  blocks?: BuilderBlock[]
  parent?: string
  path?: string
  styleProp?: Record<string, any>
}
import BuilderContext from '../context/builder.context.js'
import { isEditing } from '../functions/is-editing.js'
import type { BuilderBlock } from '../types/builder-block.js'
import BlockStyles from './render-block/block-styles'
import RenderBlock from './render-block/render-block'

function RenderBlocks(props: RenderBlockProps) {
  function className() {
    return 'builder-blocks' + (!props.blocks?.length ? ' no-blocks' : '')
  }

  function onClick() {
    if (isEditing() && !props.blocks?.length) {
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
    if (isEditing() && !props.blocks?.length) {
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

  const builderContext = useContext(BuilderContext)

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
        {props.blocks ? (
          <>
            {props.blocks?.map((block) => (
              <RenderBlock
                key={'render-block-' + block.id}
                block={block}
                context={builderContext}
              />
            ))}
          </>
        ) : null}

        {props.blocks ? (
          <>
            {props.blocks?.map((block) => (
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
