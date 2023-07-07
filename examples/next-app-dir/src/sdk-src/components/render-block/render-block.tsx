import * as React from 'react'

export type RenderBlockProps = {
  block: BuilderBlock
  context: BuilderContextInterface
  components: Dictionary<RegisteredComponent>
}
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/types'
import { getBlockActions } from '../../functions/get-block-actions'
import { getBlockComponentOptions } from '../../functions/get-block-component-options'
import { getBlockProperties } from '../../functions/get-block-properties'
import { getProcessedBlock } from '../../functions/get-processed-block'
import type { BuilderBlock } from '../../types/builder-block'
import BlockStyles from './block-styles'
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from './render-block.helpers'
import RenderRepeatedBlock from './render-repeated-block'
import { TARGET } from '../../constants/target'
import RenderComponent from './render-component'
import { getReactNativeBlockStyles } from '../../functions/get-react-native-block-styles'
import { Dictionary } from '@/sdk-src/types/typescript'

function RenderBlock(props: RenderBlockProps) {
  const component = getComponent({
    block: props.block,
    context: props.context,
    components: props.components,
  })

  function repeatItem() {
    return getRepeatItemData({
      block: props.block,
      context: props.context,
    })
  }

  function getUseBlock() {
    return repeatItem()
      ? props.block
      : getProcessedBlock({
          block: props.block,
          localState: props.context.localState,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          context: props.context.context,
          shouldEvaluateBindings: true,
        })
  }

  const Tag = props.block.tagName || 'div'

  function canShowBlock() {
    if ('hide' in getUseBlock()) {
      return !getUseBlock().hide
    }
    if ('show' in getUseBlock()) {
      return getUseBlock().show
    }
    return true
  }

  function actions() {
    return getBlockActions({
      block: getUseBlock(),
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      localState: props.context.localState,
      context: props.context.context,
    })
  }

  function attributes() {
    const blockProperties = getBlockProperties(getUseBlock())
    return {
      ...blockProperties,
      ...(TARGET === 'reactNative'
        ? {
            style: getReactNativeBlockStyles({
              block: getUseBlock(),
              context: props.context,
              blockStyles: blockProperties.style,
            }),
          }
        : {}),
    }
  }

  function childrenWithoutParentComponent() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !component?.component && !repeatItem()
    return shouldRenderChildrenOutsideRef ? getUseBlock().children ?? [] : []
  }

  function renderComponentProps() {
    return {
      blockChildren: getUseBlock().children ?? [],
      componentRef: component?.component,
      componentOptions: {
        ...getBlockComponentOptions(getUseBlock()),
        builderContext: props.context,
        ...(component?.name === 'Symbol' || component?.name === 'Columns'
          ? { builderComponents: props.components }
          : {}),
        /**
         * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
         * they are provided to the component itself directly.
         */
        ...(!component?.noWrap
          ? {}
          : {
              attributes: {
                ...attributes(),
                ...actions(),
              },
            }),
      },
      context: childrenContext,
      components: props.components,
    }
  }

  const childrenContext = props.context

  return (
    <>
      {canShowBlock() ? (
        <>
          {!component?.noWrap ? (
            <>
              {isEmptyHtmlElement(Tag) ? (
                <>
                  <Tag {...attributes()} {...actions()} />
                </>
              ) : null}
              {!isEmptyHtmlElement(Tag) && repeatItem() ? (
                <>
                  {repeatItem()?.map((data, index) => (
                    <RenderRepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                      components={props.components}
                    />
                  ))}
                </>
              ) : null}
              {!isEmptyHtmlElement(Tag) && !repeatItem() ? (
                <>
                  <Tag {...attributes()} {...actions()}>
                    <RenderComponent {...renderComponentProps()} />

                    {childrenWithoutParentComponent()?.map((child) => (
                      <RenderBlock
                        key={'render-block-' + child.id}
                        block={child}
                        context={childrenContext}
                        components={props.components}
                      />
                    ))}

                    {childrenWithoutParentComponent()?.map((child) => (
                      <BlockStyles
                        key={'block-style-' + child.id}
                        block={child}
                        context={childrenContext}
                      />
                    ))}
                  </Tag>
                </>
              ) : null}
            </>
          ) : (
            <>
              <RenderComponent {...renderComponentProps()} />
            </>
          )}
        </>
      ) : null}
    </>
  )
}

export default RenderBlock
