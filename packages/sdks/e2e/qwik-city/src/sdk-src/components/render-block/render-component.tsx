import { BuilderContextInterface } from "../../context/types.js";

import { BuilderBlock } from "../../types/builder-block.js";

import BlockStyles from "./block-styles";

import RenderBlock from "./render-block";

import { Fragment, h } from "@builder.io/qwik";

type ComponentOptions = {
  [index: string]: any;
  attributes?: {
    [index: string]: any;
  };
};
export interface RenderComponentProps {
  componentRef: any;
  componentOptions: ComponentOptions;
  blockChildren: BuilderBlock[];
  context: BuilderContextInterface;
}
export const RenderComponent = (
  props: RenderComponentProps & { key?: any }
) => {
  return (
    <>
      {props.componentRef ? (
        <props.componentRef {...props.componentOptions}>
          {(props.blockChildren || []).map(function (child) {
            return (
              <RenderBlock
                key={"render-block-" + child.id}
                block={child}
                context={props.context}
              ></RenderBlock>
            );
          })}
          {(props.blockChildren || []).map(function (child) {
            return (
              <BlockStyles
                key={"block-style-" + child.id}
                block={child}
                context={props.context}
              ></BlockStyles>
            );
          })}
        </props.componentRef>
      ) : null}
    </>
  );
};

export default RenderComponent;
