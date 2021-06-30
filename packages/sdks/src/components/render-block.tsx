import { components } from '../functions/register-component';
import { BuilderBlock } from '../types/builder-block';

export type RenderBlockProps = {
  block: BuilderBlock;
};

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

  return <>
      {getComponentInfo().noWrap && <getComponentInfo() />}
    </>;
}
