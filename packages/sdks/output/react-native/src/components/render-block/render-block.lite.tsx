import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context";
import { getBlockActions } from "../../functions/get-block-actions.js";
import { getBlockComponentOptions } from "../../functions/get-block-component-options.js";
import { getBlockProperties } from "../../functions/get-block-properties.js";
import { getBlockStyles } from "../../functions/get-block-styles.js";
import { getBlockTag } from "../../functions/get-block-tag.js";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import { components } from "../../functions/register-component.js";
import BlockStyles from "./block-styles.lite";

export default function RenderBlock(props) {
  function component() {
    const componentName = useBlock().component?.name;

    if (!componentName) {
      return null;
    }

    const ref = components[componentName];

    if (componentName && !ref) {
      // TODO: Public doc page with more info about this message
      console.warn(`
        Could not find a registered component named "${componentName}". 
        If you registered it, is the file that registered it imported by the file that needs to render it?`);
    }

    return ref;
  }

  function componentInfo() {
    return component?.()?.info;
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

  function propertiesAndActions() {
    return {
      ...getBlockProperties(useBlock()),
      ...getBlockActions({
        block: useBlock(),
        state: builderContext.state,
        context: builderContext.context,
      }),
    };
  }

  function css() {
    return getBlockStyles(useBlock());
  }

  function componentOptions() {
    return getBlockComponentOptions(useBlock());
  }

  function children() {
    // TO-DO: When should `canHaveChildren` dictate rendering?
    // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
    // but still receive and need to render children.
    // return componentInfo?.()?.canHaveChildren ? useBlock().children : [];
    return useBlock().children ?? [];
  }

  function noCompRefChildren() {
    return componentRef() ? [] : children();
  }

  const builderContext = useContext(BuilderContext);

  const ComponentRefRef = componentRef();
  const TagNameRef = tagName();

  return (
    <>
      {!componentInfo?.()?.noWrap ? (
        <>
          <TagNameRef {...propertiesAndActions()} style={css()}>
            {TARGET === "vue" || TARGET === "svelte" ? (
              <>
                <BlockStyles block={useBlock()} />
              </>
            ) : null}

            {componentRef() ? (
              <ComponentRefRef
                {...componentOptions()}
                builderBlock={useBlock()}
              >
                {children()?.map((child) => (
                  <RenderBlock block={child} />
                ))}
              </ComponentRefRef>
            ) : null}

            {noCompRefChildren()?.map((child) => (
              <RenderBlock block={child} />
            ))}
          </TagNameRef>
        </>
      ) : (
        <ComponentRefRef
          {...componentOptions()}
          attributes={propertiesAndActions()}
          builderBlock={useBlock()}
          style={css()}
        >
          {children()?.map((child) => (
            <RenderBlock block={child} />
          ))}
        </ComponentRefRef>
      )}
    </>
  );
}
