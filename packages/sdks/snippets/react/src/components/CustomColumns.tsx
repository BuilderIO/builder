import { Blocks, BuilderBlock } from '@builder.io/sdk-react';

interface CustomColumnsProps {
  columns: { blocks: BuilderBlock[] | undefined }[];
  builderBlock: BuilderBlock;
}

const CustomColumns = (props: CustomColumnsProps) => {
  return (
    <div
      className="two-columns"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        border: '10px solid #ccc',
        padding: '10px',
      }}
    >
      <Blocks
        blocks={props.columns[0]?.blocks}
        path={`component.options.columns.0.blocks`}
        parent={props.builderBlock.id}
      />

      <Blocks
        blocks={props.columns[1]?.blocks}
        path={`component.options.columns.1.blocks`}
        parent={props.builderBlock.id}
      />
    </div>
  );
};

export default CustomColumns;
