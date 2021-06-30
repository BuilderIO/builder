import { BuilderContent } from '../types/builder-content';
import RenderBlock from './render-block';

export type RenderContentProps = {
  content?: BuilderContent;
};

export default function RenderContent(props: RenderContentProps) {
  return (
    <>
      {props.content?.data?.blocks?.map((block: any) => (
        <RenderBlock block={block} />
      ))}
    </>
  );
}
