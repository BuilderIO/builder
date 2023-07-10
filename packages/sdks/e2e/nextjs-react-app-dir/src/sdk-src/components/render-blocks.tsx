import * as React from 'react';
export type RenderBlockProps = {
  context: BuilderContextInterface;
  blocks: BuilderBlock[] | undefined;
  parent?: string;
  path?: string;
  styleProp?: Record<string, any>;
  components: Dictionary<RegisteredComponent>;
};
import type { BuilderBlock } from '../types/builder-block';
import BlockStyles from './render-block/block-styles';
import RenderBlock from './render-block/render-block';
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../context/types';
import type { Dictionary } from '../types/typescript';
import RenderBlocksWrapper from './render-blocks/render-blocks-wrapper';

function RenderBlocks(props: RenderBlockProps) {
  return (
    <>
      <RenderBlocksWrapper
        blocks={props.blocks}
        parent={props.parent}
        path={props.path}
        styleProp={props.styleProp}
      >
        {props.blocks ? (
          <>
            {props.blocks?.map((block) => (
              <RenderBlock
                key={'render-block-' + block.id}
                block={block}
                components={props.components}
                context={props.context}
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
                context={props.context}
              />
            ))}
          </>
        ) : null}
      </RenderBlocksWrapper>
    </>
  );
}

export default RenderBlocks;
