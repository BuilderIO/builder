import Blocks from '../../components/blocks/blocks.lite.jsx';

export interface DropzoneProps {
  name: string;
  builderBlock: any;
  builderContext: any;
  attributes: any;
}

export default function Slot(props: DropzoneProps) {
  return (
    <div
      style={{
        pointerEvents: 'auto',
      }}
      {...(!props.builderContext.context.symbolId && {
        'builder-slot': props.name,
      })}
    >
      <Blocks
        parent={props.builderContext.context.symbolId}
        path={`symbol.data.${props.name}`}
        blocks={props.builderContext.rootState[props.name] || []}
        context={props.builderContext}
      />
    </div>
  );
}
