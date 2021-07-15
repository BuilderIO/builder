import { BuilderBlock } from '../types/builder-block';
import RenderBlock from './render-block.lite';

export type RenderBlockProps = {
  blocks?: BuilderBlock[];
};

export default function RenderBlocks(props: RenderBlockProps) {
  return (
    <>
      {props.blocks?.map((block: any) => (
        <RenderBlock block={block} />
      ))}
    </>
  );
}
