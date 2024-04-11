export default function DynamicDiv(props: {
  children?: any;
  attributes: any;
  actionAttributes: any;
  BlockWrapperProps: any;
  builderPath: any;
  builderParentId: any;
  BlocksWrapperProps: any;
  contentWrapperProps: any;
  builderModel: any;
  ref: any;
}) {
  return (
    <div
      builder-path={props.builderPath}
      builder-parent-id={props.builderParentId}
      BlocksWrapperProps={props.BlockWrapperProps}
      {...props.attributes}
      {...props.actionAttributes}
    >
      {props.children}
    </div>
  );
}
