import * as React from 'react';

type ComponentOptions = {
  [index: string]: any;
  builderBlock: BuilderBlock;
  builderContext: BuilderContextInterface;
};
export interface RenderComponentProps {
  componentRef: any;
  componentOptions: ComponentOptions;
  blockChildren: BuilderBlock[];
  context: BuilderContextInterface;
  components: Dictionary<RegisteredComponent>;
  builderBlock: BuilderBlock;
  includeBlockProps: boolean;
  isRSC: boolean;
}

import type { BuilderBlock } from '../../types/builder-block';
import BlockStyles from './block-styles';
import RenderBlock from './render-block';
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/types';
import type { Dictionary } from '@/sdk-src/types/typescript';
import { getBlockProperties } from '@/sdk-src/functions/get-block-properties';
import RenderBlockWrapper from './render-block-wrapper';

function RenderComponent(props: RenderComponentProps) {
  function attributes() {
    return getBlockProperties({
      block: props.builderBlock,
      context: props.context,
    });
  }

  const attrs = props.includeBlockProps ? { attributes: attributes() } : {};

  const Wrapper = props.isRSC ? props.componentRef : RenderBlockWrapper;

  const wrapperProps = props.isRSC
    ? {
        ...props.componentOptions,
        ...attrs,
      }
    : {
        Wrapper: props.componentRef,
        block: props.builderBlock,
        context: props.context,
        wrapperProps: props.componentOptions,
        shouldNestAttributes: true,
      };

  return (
    <>
      {props.componentRef ? (
        <>
          <Wrapper {...wrapperProps}>
            {props.blockChildren?.map((child) => (
              <RenderBlock
                key={'render-block-' + child.id}
                block={child}
                context={props.context}
                components={props.components}
              />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles
                key={'block-style-' + child.id}
                block={child}
                context={props.context}
              />
            ))}
          </Wrapper>
        </>
      ) : null}
    </>
  );
}

export default RenderComponent;
