import * as React from "react";
import DynamicRenderer from "../../components/dynamic-renderer/dynamic-renderer";
import { getClassPropName } from "../../functions/get-class-prop-name.js";
import { filterAttrs } from "../helpers.js";
import type { ButtonProps } from "./button.types.js";

function Button(props: ButtonProps) {
  function attrs() {
    return {
      ...props.attributes,
      [getClassPropName()]: `${props.link ? "" : "builder-button"} ${
        props.attributes[getClassPropName()] || ""
      }`,
      ...(props.link
        ? {
            href: props.link,
            target: props.openLinkInNewTab ? "_blank" : undefined,
            role: "link",
          }
        : {
            role: "button",
          }),
    };
  }

  return (
    <DynamicRenderer
      attributes={attrs()}
      TagName={props.link ? props.builderLinkComponent || "a" : "button"}
      actionAttributes={{}}
    >
      {props.text}
    </DynamicRenderer>
  );
}

export default Button;
