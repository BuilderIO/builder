import { components } from '../functions/register-component';
import { BuilderBlock } from '../types/builder-block';
import { Component } from './component';

export type RenderBlockProps = {
  block: BuilderBlock;
};

// TODO: bindings
export default function RenderBlock(props: RenderBlockProps) {
  function getComponent() {
    return components[props.block.component?.name];
  }

  function getComponentInfo() {
    return getComponent().info;
  }

  function getComponentRef() {
    return getComponent()?.ref;
  }

  function getTagName() {
    return props.block.tagName || 'div';
  }

  function getProperties() {
    return props.block.properties || {};
  }

  function getCss() {
    // TODO: responsive @media queries too
    return props.block.responsiveStyles?.large || {};
  }

  return (
    <>
      {getComponentInfo().noWrap && (
        <Component is={getComponentRef()} {...getComponentInfo().options} css={getCss()} />
      )}
      {!getComponentInfo().noWrap && (
        <Component is={getTagName()} {...getProperties()} css={getCss()}>
          {getComponentRef() && (
            <Component is={getComponentRef()} {...getComponentInfo().options} />
          )}
        </Component>
      )}
    </>
  );
}
