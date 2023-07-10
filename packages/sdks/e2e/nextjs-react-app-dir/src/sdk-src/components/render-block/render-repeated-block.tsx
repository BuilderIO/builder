import * as React from 'react';

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
  components: Dictionary<RegisteredComponent>;
};
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/types';
import type { BuilderBlock } from '../../types/builder-block';
import RenderBlock from './render-block';
import { Dictionary } from '@/sdk-src/types/typescript';

function RenderRepeatedBlock(props: Props) {
  return (
    // TO-DO: how do we create a new context for each repeated block?
    // do we just rely on the prop instead?
    // <BuilderContext.Provider value={props.repeatContext}>
    <RenderBlock
      block={props.block}
      context={props.repeatContext}
      components={props.components}
    />
    // </BuilderContext.Provider>
  );
}

export default RenderRepeatedBlock;
