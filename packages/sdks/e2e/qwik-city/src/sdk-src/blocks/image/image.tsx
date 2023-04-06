import { BuilderBlock } from "../../types/builder-block.js";

import { getSrcSet } from "./image.helpers.js";

import { JSX } from "@builder.io/mitosis/jsx-runtime";

import {
  Fragment,
  Slot,
  component$,
  h,
  useComputed$,
  useStylesScoped$,
} from "@builder.io/qwik";

export interface ImageProps {
  className?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  children?: JSX.Element;
  fitContent?: boolean;
  builderBlock?: BuilderBlock;
  noWebp?: boolean;
  src?: string;
}
export const Image = component$((props: ImageProps) => {
  useStylesScoped$(STYLES);

  const state: any = {};
  const srcSetToUse = useComputed$(() => {
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
  });
  const webpSrcSet = useComputed$(() => {
    if (srcSetToUse.value?.match(/builder\.io/) && !props.noWebp) {
      return srcSetToUse.value.replace(/\?/g, "?format=webp&");
    } else {
      return "";
    }
  });
  const aspectRatioCss = useComputed$(() => {
    const aspectRatioStyles = {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: "0px",
      top: "0px",
    };
    const out = props.aspectRatio ? aspectRatioStyles : undefined;
    return out;
  });
  return (
    <Fragment>
      <picture>
        {webpSrcSet.value ? (
          <source type="image/webp" srcSet={webpSrcSet.value} />
        ) : null}
        <img
          loading="lazy"
          alt={props.altText}
          role={props.altText ? "presentation" : undefined}
          style={{
            objectPosition: props.backgroundPosition || "center",
            objectFit: props.backgroundSize || "cover",
            ...aspectRatioCss.value,
          }}
          class={
            "builder-image" +
            (props.className ? " " + props.className : "") +
            " img-Image"
          }
          src={props.image}
          srcSet={srcSetToUse.value}
          sizes={props.sizes}
        />
      </picture>
      {props.aspectRatio &&
      !(props.builderBlock?.children?.length && props.fitContent) ? (
        <div
          class="builder-image-sizer div-Image"
          style={{
            paddingTop: props.aspectRatio! * 100 + "%",
          }}
        ></div>
      ) : null}
      {props.builderBlock?.children?.length && props.fitContent ? (
        <Slot></Slot>
      ) : null}
      {!props.fitContent && props.children ? (
        <div class="div-Image-2">
          <Slot></Slot>
        </div>
      ) : null}
    </Fragment>
  );
});

export default Image;

export const STYLES = `
.img-Image {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}
.div-Image {
  width: 100%;
  pointer-events: none;
  font-size: 0;
}
.div-Image-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
`;
