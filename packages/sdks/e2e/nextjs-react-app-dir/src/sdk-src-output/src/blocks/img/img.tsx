'use client';
import * as React from "react";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
export interface ImgProps {
  attributes?: any;
  imgSrc?: string; // TODO(misko): I think this is unused
  image?: string;
  altText?: string;
  backgroundSize?: "cover" | "contain";
  backgroundPosition?:
    | "center"
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
}

import { isEditing } from "../../functions/is-editing";
import { filterAttrs } from "../helpers";
import { setAttrs } from "../helpers";

function ImgComponent(props: ImgProps) {
  const _context = { ...props["_context"] };

  return (
    <img
      style={{
        objectFit: props.backgroundSize || "cover",
        objectPosition: props.backgroundPosition || "center",
      }}
      key={(isEditing() && props.imgSrc) || "default-key"}
      alt={props.altText}
      src={props.imgSrc || props.image}
      {...{}}
      {...props.attributes}
    />
  );
}

export default ImgComponent;
