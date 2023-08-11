import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState } from "react";
import { getBlockActions } from "../../functions/get-block-actions.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import BlockStyles from "./block-styles";
import {
  getComponent,
  getRepeatItemData,
  isEmptyHtmlElement,
} from "./render-block.helpers.js";
import RenderRepeatedBlock from "./render-repeated-block";
import { TARGET } from "../../constants/target.js";
import { extractTextStyles } from "../../functions/extract-text-styles.js";
import RenderComponent from "./render-component";
import { getReactNativeBlockStyles } from "../../functions/get-react-native-block-styles.js";

function RenderBlock(props) {
  const [component, setComponent] = useState(() =>
    getComponent({
      block: props.block,
      context: props.context,
    })
  );

  function repeatItem() {
    return getRepeatItemData({
      block: props.block,
      context: props.context,
    });
  }

  function useBlock() {
    return repeatItem()
      ? props.block
      : getProcessedBlock({
          block: props.block,
          localState: props.context.localState,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          context: props.context.context,
          shouldEvaluateBindings: true,
        });
  }

  const [tag, setTag] = useState(() => props.block.tagName || "div");

  function canShowBlock() {
    if ("hide" in useBlock()) {
      return !useBlock().hide;
    }
    if ("show" in useBlock()) {
      return useBlock().show;
    }
    return true;
  }

  function actions() {
    return getBlockActions({
      block: useBlock(),
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      localState: props.context.localState,
      context: props.context.context,
    });
  }

  function attributes() {
    const blockProperties = getBlockProperties(useBlock());
    return {
      ...blockProperties,
      ...(TARGET === "reactNative"
        ? {
            style: getReactNativeBlockStyles({
              block: useBlock(),
              context: props.context,
              blockStyles: blockProperties.style,
            }),
          }
        : {}),
    };
  }

  function childrenWithoutParentComponent() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !component?.component && !repeatItem();
    return shouldRenderChildrenOutsideRef ? useBlock().children ?? [] : [];
  }

  function childrenContext() {
    const getInheritedTextStyles = () => {
      if (TARGET !== "reactNative") {
        return {};
      }
      return extractTextStyles(
        getReactNativeBlockStyles({
          block: useBlock(),
          context: props.context,
          blockStyles: attributes().style,
        })
      );
    };
    return {
      apiKey: props.context.apiKey,
      apiVersion: props.context.apiVersion,
      localState: props.context.localState,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      content: props.context.content,
      context: props.context.context,
      registeredComponents: props.context.registeredComponents,
      inheritedStyles: getInheritedTextStyles(),
    };
  }

  function renderComponentProps() {
    return {
      blockChildren: useBlock().children ?? [],
      componentRef: component?.component,
      componentOptions: {
        ...getBlockComponentOptions(useBlock()),
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
      context: childrenContext(),
    };
  }

  return (
    <>
      {canShowBlock() ? (
        <>
          {!component?.noWrap ? (
            <>
              {isEmptyHtmlElement(tag) ? (
                <>
                  <View {...attributes()} {...actions()} />
                </>
              ) : null}
              {!isEmptyHtmlElement(tag) && repeatItem() ? (
                <>
                  {repeatItem()?.map((data, index) => (
                    <RenderRepeatedBlock
                      key={index}
                      repeatContext={data.context}
                      block={data.block}
                    />
                  ))}
                </>
              ) : null}
              {!isEmptyHtmlElement(tag) && !repeatItem() ? (
                <>
                  <View {...attributes()} {...actions()}>
                    <RenderComponent {...renderComponentProps()} />

                    {childrenWithoutParentComponent()?.map((child) => (
                      <RenderBlock
                        key={"render-block-" + child.id}
                        block={child}
                        context={childrenContext()}
                      />
                    ))}

                    {childrenWithoutParentComponent()?.map((child) => (
                      <BlockStyles
                        key={"block-style-" + child.id}
                        block={child}
                        context={childrenContext()}
                      />
                    ))}
                  </View>
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
  );
}

export default RenderBlock;
