'use client';
import * as React from 'react';
import { useContext } from 'react';
import BuilderContext from '../../context/builder.context';
import ComponentsContext from '../../context/components.context';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types';
import Block from '../block/block';
import BlockStyles from '../block/components/block-styles';
import type { BlocksWrapperProps } from './blocks-wrapper';
import BlocksWrapper from './blocks-wrapper';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
};

function Blocks(props: BlocksProps) {
  const builderContext = useContext(BuilderContext);

  const componentsContext = useContext(ComponentsContext);

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
    >
      {props.blocks ? (
        <>
          {props.blocks?.map((block) => (
            <Block
              key={'render-block-' + block.id}
              block={block}
              context={props.context || builderContext}
              registeredComponents={
                props.registeredComponents ||
                componentsContext.registeredComponents
              }
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
              context={props.context || builderContext}
            />
          ))}
        </>
      ) : null}
    </BlocksWrapper>
  );
}

export default Blocks;
