import BuilderContext from '../../context/builder.context';

import ComponentsContext from '../../context/components.context';

import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types';

import Block from '../block/block';

import BlockStyles from '../block/components/block-styles';

import type { BlocksWrapperProps } from './blocks-wrapper';
import { default as BlocksWrapper } from './blocks-wrapper';

import { component$, useContext } from '@builder.io/qwik';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
};
export const Blocks = component$((props: BlocksProps) => {
  const builderContext = useContext(BuilderContext);
  const componentsContext = useContext(ComponentsContext);

  return (
    <>
      <div>
        BLOCKS (outside wrapper): {props.blocks?.[1]?.component?.options.text}
      </div>
      <BlocksWrapper
        blocks={props.blocks}
        parent={props.parent}
        path={props.path}
        styleProp={props.styleProp}
      >
        <div>BLOCKS: {props.blocks?.[1]?.component?.options.text}</div>
        {props.blocks
          ? (props.blocks || []).map((block) => {
              return (
                <Block
                  key={'render-block-' + block.id}
                  block={block}
                  context={props.context || builderContext}
                  registeredComponents={
                    props.registeredComponents ||
                    componentsContext.registeredComponents
                  }
                ></Block>
              );
            })
          : null}
        {props.blocks
          ? (props.blocks || []).map((block) => {
              return (
                <BlockStyles
                  key={'block-style-' + block.id}
                  block={block}
                  context={props.context || builderContext}
                ></BlockStyles>
              );
            })
          : null}
      </BlocksWrapper>
    </>
  );
});

export default Blocks;
