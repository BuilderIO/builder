import BuilderContext from '../../context/builder.context';

import ComponentsContext from '../../context/components.context';

import {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types';

import Block from '../block/block';

import BlockStyles from '../block/components/block-styles';

import { BlocksWrapperProps, default as BlocksWrapper } from './blocks-wrapper';

import { Fragment, component$, h, useContext } from '@builder.io/qwik';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
};
export const Blocks = component$((props: BlocksProps) => {
  const builderContext = useContext(BuilderContext);
  const componentsContext = useContext(ComponentsContext);

  return (
    <div>
      <div>
        in Blocks. context:{' '}
        {builderContext?.content?.data?.blocks?.[0]?.component?.options.text}
      </div>
      <div>in Blocks. block: {props.blocks?.[0]?.component?.options.text}</div>

      {/* <Block
        block={props.blocks?.[0]}
        context={props.context || builderContext}
        registeredComponents={
          props.registeredComponents || componentsContext.registeredComponents
        }
      ></Block> */}

      {builderContext?.content?.data?.blocks?.map((block) => {
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
      })}
      {props.blocks
        ? props.blocks.map(function (block) {
            return (
              <BlockStyles
                key={'block-style-' + block.id}
                block={block}
                context={props.context || builderContext}
              ></BlockStyles>
            );
          })
        : null}
    </div>
  );
});

export default Blocks;
