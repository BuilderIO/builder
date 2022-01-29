import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useContext } from 'react';
import { getBlockComponentOptions } from '../functions/get-block-component-options';
import { getBlockProperties } from '../functions/get-block-properties';
import { getBlockStyles } from '../functions/get-block-styles';
import { getBlockTag } from '../functions/get-block-tag';
import { components } from '../functions/register-component';
import BuilderContext from '../context/builder.context.lite';
import { getBlockActions } from '../functions/get-block-actions';
import { getProcessedBlock } from '../functions/get-processed-block';
import BlockStyles from './block-styles.lite';
import RenderBlocks from './render-blocks.lite';

export default function RenderBlock(props) {
  function component() {
    const componentName = useBlock().component?.name;

    if (!componentName) {
      return null;
    }

    const ref = components[useBlock().component?.name];

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

  function properties() {
    return getBlockProperties(useBlock());
  }

  function useBlock() {
    return getProcessedBlock({
      block: props.block,
      state: builderContext.state,
      context: builderContext.context,
    });
  }

  function propertiesAndActions() {
    return { ...properties(), ...actions() };
  }

  function actions() {
    return getBlockActions({
      block: useBlock(),
      state: builderContext.state,
      context: builderContext.context,
    });
  }

  function css() {
    return getBlockStyles(useBlock());
  }

  function componentOptions() {
    return getBlockComponentOptions(useBlock());
  }

  const builderContext = useContext(BuilderContext);

  const ComponentRefRef = componentRef();
  const TagNameRef = tagName();

  return (
    <>
      {!componentInfo?.()?.noWrap ? (
        <>
          <TagNameRef {...propertiesAndActions()} style={css()}>
            <BlockStyles block={useBlock()} />

            {componentRef() ? (
              <ComponentRefRef
                {...componentOptions()}
                builderBlock={useBlock()}
              >
                {componentInfo?.()?.canHaveChildren && useBlock().children ? (
                  <>
                    <RenderBlocks
                      path="children"
                      blocks={useBlock().children}
                    />
                  </>
                ) : null}

                {!componentInfo?.()?.canHaveChildren
                  ? useBlock().children
                  : []?.map((child) => <RenderBlock block={child} />)}
              </ComponentRefRef>
            ) : null}

            {!componentRef() &&
            componentInfo?.()?.canHaveChildren &&
            useBlock().children ? (
              <>
                <RenderBlocks path="children" blocks={useBlock().children} />
              </>
            ) : null}

            {!componentRef() && !componentInfo?.()?.canHaveChildren
              ? useBlock().children
              : []?.map((child) => <RenderBlock block={child} />)}
          </TagNameRef>
        </>
      ) : (
        <ComponentRefRef
          {...componentOptions()}
          attributes={propertiesAndActions()}
          builderBlock={useBlock()}
          style={css()}
        >
          {componentInfo?.()?.canHaveChildren && useBlock().children ? (
            <>
              <RenderBlocks blocks={useBlock().children} />
            </>
          ) : null}

          {!componentInfo?.()?.canHaveChildren
            ? useBlock().children
            : []?.map((child) => <RenderBlock block={child} />)}
        </ComponentRefRef>
      )}
    </>
  );
}
