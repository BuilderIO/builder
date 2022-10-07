import BuilderEditing from './BuilderEditing.client';
import { RenderContent, RenderContentProps } from './render-content';

export type RenderContentServerProps = RenderContentProps & {
  isEditing: boolean;
};

export default function RenderServerContent(props: RenderContentProps) {
  const innards = <RenderContent {...props} />;

  return (
    <>
      {/* TODO: maybe only include if has a query param */}
      {props.isEditing ? (
        <BuilderEditing model={props.model} components={props.customCompoennts}>
          {innards}
        </BuilderEditing>
      ) : (
        innards
      )}
    </>
  );
}
