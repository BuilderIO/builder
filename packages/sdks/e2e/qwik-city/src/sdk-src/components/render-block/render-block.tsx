import { BuilderContextInterface } from '../../context/types.js';
import { BuilderBlock } from '../../types/builder-block.js';
import {
  getComponent,
} from './render-block.helpers.js';
import {
  component$,
  useStore,
} from '@builder.io/qwik';

export type RenderBlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};
export const RenderBlock = component$((props: RenderBlockProps) => {
  const state = useStore<any>({
    tag: props.block.tagName || 'div',
    ref: getComponent({
      block: props.block,
      context: props.context,
    })?.component,
  });
  return (
    <state.tag>
      {state.ref ? (
        <state.ref attributes={{}}>
          {(props.block.children || []).map(function (child) {
            return (
              <RenderBlock
                key={'render-block-' + child.id}
                block={child}
                context={props.context}
              ></RenderBlock>
            );
          })}
        </state.ref>
      ) : null}
    </state.tag>
  );
});

export default RenderBlock;
