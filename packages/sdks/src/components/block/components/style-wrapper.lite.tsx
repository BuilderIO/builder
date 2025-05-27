import {
  onMount,
  onUpdate,
  Show,
  useContext,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { TARGET } from '../../../constants/target.js';
import {
  isEditing,
  type BuilderBlock,
  type BuilderContextInterface,
} from '../../../server-index.js';
import BlockStyles from './block-styles.lite.jsx';
import LiveEditBlockStyles from './live-edit-block-styles.lite.jsx';
import { BuilderContext } from '../../../context/index.js';

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
  const contextProvider = useContext(BuilderContext);
  
  const state = useStore({
    isClientEditing: false,
    isHydrated: false,
  });

  onMount(() => {
    useTarget({
      rsc: () => {
        state.isClientEditing = isEditing();
        state.isHydrated = true;
      },
      default: () => {},
    });
  });
  return (
    <Show
      when={state.isHydrated}
      else={<BlockStyles block={props.block} context={props.context} />}
    >
      <Show
        when={TARGET === 'rsc' && state.isClientEditing}
        else={<BlockStyles block={props.block} context={props.context} />}
      >
        <LiveEditBlockStyles id={props.block.id} contextProvider={contextProvider.value} />
      </Show>
    </Show>
  );
}
