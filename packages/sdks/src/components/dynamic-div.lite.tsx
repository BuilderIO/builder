/*
 * Only used for Angular SDK as Angular doesn't support 'div' as a component
 */
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
  return <div>{props.children}</div>;
}
