import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";
import BuilderContext from "../../context/builder.context";
import { getBlockActions } from "../../functions/get-block-actions.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getBlockStyles } from "../../functions/get-block-styles.js";
import { getBlockTag } from "../../functions/get-block-tag.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import { isEmptyHtmlElement } from "./render-block.helpers.js";
import RenderComponentAndStyles from "./render-component-and-styles.lite";

export default function RenderBlock(props) {
  function component() {
    const componentName = useBlock().component?.name;

    if (!componentName) {
      return null;
    }

    const ref = builderContext.registeredComponents[componentName];

    if (!ref) {
      // TODO: Public doc page with more info about this message
      console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
      return undefined;
    } else {
      return ref;
    }
  }

  function componentInfo() {
    if (component()) {
      const { component: _, ...info } = component();
      return info;
    } else {
      return undefined;
    }
  }

  function componentRef() {
    return component?.()?.component;
  }

  function tagName() {
    return getBlockTag(useBlock());
  }

  function useBlock() {
    return getProcessedBlock({
      block: props.block,
      state: builderContext.state,
      context: builderContext.context,
    });
  }

  function attributes() {
    return {
      ...getBlockProperties(useBlock()),
      ...getBlockActions({
        block: useBlock(),
        state: builderContext.state,
        context: builderContext.context,
      }),
      style: getBlockStyles(useBlock()),
    };
  }

  function shouldWrap() {
    return !componentInfo?.()?.noWrap;
  }

  function componentOptions() {
    return {
      ...getBlockComponentOptions(useBlock()),

      /**
       * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
       * they are provided to the component itself directly.
       */
      ...(shouldWrap()
        ? {}
        : {
            attributes: attributes(),
          }),
    };
  }

  function children() {
    // TO-DO: When should `canHaveChildren` dictate rendering?
    // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
    // but still receive and need to render children.
    // return componentInfo?.()?.canHaveChildren ? useBlock().children : [];
    return useBlock().children ?? [];
  }

  function noCompRefChildren() {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`
     */
    return componentRef() ? [] : children();
  }

  const builderContext = useContext(BuilderContext);

  const TagNameRef = tagName();

  return (
    <>
      {shouldWrap() ? (
        <>
          {!isEmptyHtmlElement(tagName()) ? (
            <>
              <TagNameRef {...attributes()}>
                <RenderComponentAndStyles
                  block={useBlock()}
                  blockChildren={children()}
                  componentRef={componentRef()}
                  componentOptions={componentOptions()}
                />

                {noCompRefChildren()?.map((child) => (
                  <RenderBlock key={child.id} block={child} />
                ))}
              </TagNameRef>
            </>
          ) : (
            <TagNameRef {...attributes()} />
          )}
        </>
      ) : (
        <RenderComponentAndStyles
          block={useBlock()}
          blockChildren={children()}
          componentRef={componentRef()}
          componentOptions={componentOptions()}
        />
      )}
    </>
  );
}
