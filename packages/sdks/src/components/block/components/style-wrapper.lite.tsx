import { Show, useMetadata } from '@builder.io/mitosis';
import { TARGET } from '../../../constants/target.js';
import {
  isEditing,
  type BuilderBlock,
  type BuilderContextInterface,
} from '../../../server-index.js';
import BlockStyles from './block-styles.lite.jsx';
import LiveEditBlockStyles from './live-edit-block-styles.lite.jsx';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

type StyleWrapperProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
  id?: string;
};

export default function StyleWrapper(props: StyleWrapperProps) {
  return (
    <Show
      when={TARGET === 'rsc' && isEditing()}
      else={<BlockStyles block={props.block} context={props.context} />}
    >
      <LiveEditBlockStyles id={props.id} />
    </Show>
  );
}
