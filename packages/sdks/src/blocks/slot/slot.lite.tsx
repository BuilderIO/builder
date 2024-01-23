import type { Signal } from '@builder.io/mitosis';
import { useMetadata, useStore } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import type { BuilderContextInterface } from '../../context/types.js';
import type { BuilderBlock } from '../../types/builder-block.js';

export interface DropzoneProps {
  name: string;
  builderBlock: BuilderBlock;
  builderContext: Signal<BuilderContextInterface>;
  attributes: any;
}

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

export default function Slot(props: DropzoneProps) {
  const state = useStore({
    get symbolId() {
      return props.builderContext.value.context?.symbolId as string | undefined;
    },
    get blocks() {
      return (
        (props.builderContext.value.rootState[props.name] as BuilderBlock[]) ||
        []
      );
    },
  });
  return (
    <div
      style={{
        pointerEvents: 'auto',
      }}
      {...(!state.symbolId && {
        'builder-slot': props.name,
      })}
    >
      <Blocks
        parent={state.symbolId}
        path={`symbol.data.${props.name}`}
        blocks={state.blocks}
        context={props.builderContext}
      />
    </div>
  );
}
