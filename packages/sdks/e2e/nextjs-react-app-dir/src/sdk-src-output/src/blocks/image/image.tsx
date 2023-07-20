'use client';
import * as React from "react";

export interface ImageProps {
  className?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: "cover" | "contain";
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  children?: JSX.Element;
  fitContent?: boolean;
  builderBlock?: BuilderBlock;
  noWebp?: boolean;
  src?: string;
}

import type { BuilderBlock } from "../../types/builder-block";
import { getSrcSet } from "./image.helpers";

function Image(props: ImageProps) {
  const _context = { ...props["_context"] };

  const state = {
    get srcSetToUse() {
      const imageToUse = props.image || props.src;
      const url = imageToUse;
      if (
        !url ||
        // We can auto add srcset for cdn.builder.io and shopify
        // images, otherwise you can supply this prop manually
        !(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))
      ) {
        return props.srcset;
      }
      if (props.srcset && props.image?.includes("builder.io/api/v1/image")) {
        if (!props.srcset.includes(props.image.split("?")[0])) {
          console.debug("Removed given srcset");
          return getSrcSet(url);
        }
      } else if (props.image && !props.srcset) {
        return getSrcSet(url);
      }
      return getSrcSet(url);
    },
    get webpSrcSet() {
      if (state.srcSetToUse?.match(/builder\.io/) && !props.noWebp) {
        return state.srcSetToUse.replace(/\?/g, "?format=webp&");
      } else {
        return "";
      }
    },
    get aspectRatioCss() {
      const aspectRatioStyles = {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: "0px",
        top: "0px",
      } as const;
      const out = props.aspectRatio ? aspectRatioStyles : undefined;
      return out;
    },
  };

  return (
    <>
      <>
        <picture>
          {state.webpSrcSet ? (
            <>
              <source type="image/webp" srcSet={state.webpSrcSet} />
            </>
          ) : null}

          <img
            loading="lazy"
            alt={props.altText}
            role={props.altText ? "presentation" : undefined}
            style={{
              objectPosition: props.backgroundPosition || "center",
              objectFit: props.backgroundSize || "cover",
              ...state.aspectRatioCss,
            }}
            className={
              "builder-image" +
              (props.className ? " " + props.className : "") +
              " img-77e9f242"
            }
            src={props.image}
            srcSet={state.srcSetToUse}
            sizes={props.sizes}
          />
        </picture>

        {props.aspectRatio &&
        !(props.builderBlock?.children?.length && props.fitContent) ? (
          <>
            <div
              className="builder-image-sizer div-77e9f242"
              style={{
                paddingTop: props.aspectRatio! * 100 + "%",
              }}
            />
          </>
        ) : null}

        {props.builderBlock?.children?.length && props.fitContent ? (
          <>{props.children}</>
        ) : null}

        {!props.fitContent && props.children ? (
          <>
            <div className="div-77e9f242-2">{props.children}</div>
          </>
        ) : null}
      </>

      <style>{`.img-77e9f242 {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}.div-77e9f242 {
  width: 100%;
  pointer-events: none;
  font-size: 0;
}.div-77e9f242-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}`}</style>
    </>
  );
}

export default Image;
