import { Show, createSignal } from "solid-js";

import { css } from "solid-styled-components";

import { getSrcSet } from "./image.helpers.js";

function Image(props) {
  function srcSetToUse() {
    const imageToUse = props.image || props.src;
    const url = imageToUse;

    if (
      !url || // We can auto add srcset for cdn.builder.io and shopify
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
  }

  function webpSrcSet() {
    if (srcSetToUse()?.match(/builder\.io/) && !props.noWebp) {
      return srcSetToUse().replace(/\?/g, "?format=webp&");
    } else {
      return "";
    }
  }

  function aspectRatioCss() {
    const aspectRatioStyles = {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: "0px",
      top: "0px",
    };
    const out = props.aspectRatio ? aspectRatioStyles : undefined;
    return out;
  }

  return (
    <>
      <picture>
        <Show when={webpSrcSet()}>
          <source type="image/webp" srcset={webpSrcSet()} />
        </Show>
        <img
          class={
            "builder-image" +
            (props.className ? " " + props.className : "") +
            " " +
            css({
              opacity: "1",
              transition: "opacity 0.2s ease-in-out",
            })
          }
          loading="lazy"
          alt={props.altText}
          role={props.altText ? "presentation" : undefined}
          style={{
            "object-position": props.backgroundPosition || "center",
            "object-fit": props.backgroundSize || "cover",
            ...aspectRatioCss(),
          }}
          src={props.image}
          srcset={srcSetToUse()}
          sizes={props.sizes}
        />
      </picture>
      <Show
        when={
          props.aspectRatio &&
          !(props.builderBlock?.children?.length && props.fitContent)
        }
      >
        <div
          class={
            "builder-image-sizer " +
            css({
              width: "100%",
              pointerEvents: "none",
              fontSize: "0",
            })
          }
          style={{
            "padding-top": props.aspectRatio * 100 + "%",
          }}
        ></div>
      </Show>
      <Show when={props.builderBlock?.children?.length && props.fitContent}>
        {props.children}
      </Show>
      <Show when={!props.fitContent && props.children}>
        <div
          class={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
          })}
        >
          {props.children}
        </div>
      </Show>
    </>
  );
}

export default Image;
