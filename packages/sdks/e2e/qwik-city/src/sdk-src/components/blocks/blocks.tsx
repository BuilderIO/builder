import BuilderContext from '../../context/builder.context.js';

import ComponentsContext from '../../context/components.context.js';

import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types.js';

import Block from '../block/block';

import BlockStyles from '../block/components/block-styles';

import type { BlocksWrapperProps } from './blocks-wrapper';
import { default as BlocksWrapper } from './blocks-wrapper';

import { Fragment, component$, useContext } from '@builder.io/qwik';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context?: BuilderContextInterface;
  registeredComponents?: RegisteredComponents;
};
export const Blocks = component$((props: BlocksProps) => {
  const builderContext = useContext(BuilderContext);
  const componentsContext = useContext(ComponentsContext);

  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
    >
      <div>
        in BLOCKS (outside loop):{' '}
        {
          // @ts-ignore
          props.context.content.data.blocks[2].children[1].component.options
            .columns[0].blocks[1].component.options.text
        }
      </div>
      {props.blocks
        ? (props.blocks || []).map((block) => {
            return (
              <Fragment key={'render-block-' + block.id}>
                {/* <div>
        in BLOCKS (inside loop): {props.context.content.data.blocks[2].children[1].component.options.columns[0].blocks[1].component.options.text}
      </div> */}
                <Block
                  key={'render-block-' + block.id}
                  block={block}
                  context={props.context || builderContext}
                  registeredComponents={
                    props.registeredComponents ||
                    componentsContext.registeredComponents
                  }
                ></Block>
              </Fragment>
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
  );
});

export default Blocks;
