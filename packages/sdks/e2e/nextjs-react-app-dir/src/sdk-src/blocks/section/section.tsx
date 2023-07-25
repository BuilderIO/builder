"use client";
import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
  builderBlock?: any;
}

import { filterAttrs } from "../helpers.js";
import { setAttrs } from "../helpers.js";

function SectionComponent(props: SectionProps) {
  return (
    <section
      {...{}}
      {...props.attributes}
      style={{
        width: "100%",
        alignSelf: "stretch",
        flexGrow: 1,
        boxSizing: "border-box",
        maxWidth: props.maxWidth || 1200,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {props.children}
    </section>
  );
}

export default SectionComponent;
