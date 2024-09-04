import { Blocks, BuilderBlock } from "@builder.io/sdk-react";
import { Key } from "react";

interface CustomColumnProps 
{ 
  inside: { 
    blocks: BuilderBlock[] | undefined; 
  }[];
  
  builderBlock: { id: string | undefined; }; 
}

const CustomColumns = (props: CustomColumnProps) => {
    return (
      <div
        className="two-columns"
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {props.inside?.map((block: { blocks: BuilderBlock[] | undefined; }, index: Key | null | undefined) => (
          <Blocks
            key={index}
            blocks={block.blocks}
            path={`component.options.inside.${index}.blocks`}
            parent={props.builderBlock.id}
          />
        ))}
      </div>
    );
   };

   export default CustomColumns
   