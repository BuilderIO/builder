import type { Signal } from '@builder.io/mitosis';
import { useMetadata, useTarget } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import type { BuilderContextInterface } from '../../context/types.js';
import { deoptSignal } from '../../functions/deopt.js';
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
  return (
    <div
      style={{
        pointerEvents: 'auto',
      }}
      {...(!props.builderContext.value.context?.symbolId && {
        'builder-slot': props.name,
      })}
    >
      <Blocks
        parent={props.builderContext.value.context?.symbolId as string}
        path={`symbol.data.${props.name}`}
        blocks={useTarget({
          /**
           * Workaround until https://github.com/BuilderIO/qwik/issues/5017 is fixed.
           */
          qwik: deoptSignal(
            props.builderContext.value.rootState?.[props.name]
          ) as BuilderBlock[],
          default: props.builderContext.value.rootState?.[
            props.name
          ] as BuilderBlock[],
        })}
        context={props.builderContext}
      />
    </div>
  );
}
