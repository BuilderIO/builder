import * as React from "react";

export interface DynamicRendererProps {
  children?: any;
  TagName: any;
  attributes: any;
  actionAttributes: any;
}

import { isEmptyElement } from "./dynamic-renderer.helpers.js";
import { setAttrs } from "../../blocks/helpers.js";

function DynamicRenderer(props: DynamicRendererProps) {
  return (
    <>
      {!isEmptyElement(props.TagName) ? (
        <>
          {typeof props.TagName === "string" ? (
            <>
              <props.TagName {...props.attributes} {...props.actionAttributes}>
                {props.children}
              </props.TagName>
            </>
          ) : (
            <>
              <props.TagName {...props.attributes} {...props.actionAttributes}>
                {props.children}
              </props.TagName>
            </>
          )}
        </>
      ) : (
        <>
          <props.TagName {...props.attributes} {...props.actionAttributes} />
        </>
      )}
    </>
  );
}

export default DynamicRenderer;
