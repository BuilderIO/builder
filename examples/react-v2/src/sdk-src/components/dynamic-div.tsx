import * as React from "react";

export interface DynamicDivProps {
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
}

function DynamicDiv(props: DynamicDivProps) {
  return <div>{props.children}</div>;
}

export default DynamicDiv;
