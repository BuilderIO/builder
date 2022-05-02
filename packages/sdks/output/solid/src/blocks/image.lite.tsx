import { Show } from "solid-js";

import { createMutable } from "solid-js/store";
import { css } from "solid-styled-components";

export default function Image(props) {
  const state = createMutable({
    updateQueryParam: function updateQueryParam(uri = "", key, value) {
      const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      const separator = uri.indexOf("?") !== -1 ? "&" : "?";

      if (uri.match(re)) {
        return uri.replace(
          re,
          "$1" + key + "=" + encodeURIComponent(value) + "$2"
        );
      }

      return uri + separator + key + "=" + encodeURIComponent(value);
    },
    removeProtocol: function removeProtocol(path) {
      return path.replace(/http(s)?:/, "");
    },
    getShopifyImageUrl: function getShopifyImageUrl(src, size) {
      if (!src || !src?.match(/cdn\.shopify\.com/) || !size) {
        return src;
      }

      if (size === "master") {
        return state.removeProtocol(src);
      }

      const match = src.match(
        /(_\d+x(\d+)?)?(\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?)/i
      );

      if (match) {
        const prefix = src.split(match[0]);
        const suffix = match[3];
        const useSize = size.match("x") ? size : `${size}x`;
        return state.removeProtocol(`${prefix[0]}_${useSize}${suffix}`);
      }

      return null;
    },
    getSrcSet: function getSrcSet(url) {
      if (!url) {
        return url;
      }

      const sizes = [100, 200, 400, 800, 1200, 1600, 2000];

      if (url.match(/builder\.io/)) {
        let srcUrl = url;
        const widthInSrc = Number(url.split("?width=")[1]);

        if (!isNaN(widthInSrc)) {
          srcUrl = `${srcUrl} ${widthInSrc}w`;
        }

        return sizes
          .filter((size) => size !== widthInSrc)
          .map(
            (size) => `${state.updateQueryParam(url, "width", size)} ${size}w`
          )
          .concat([srcUrl])
          .join(", ");
      }

      if (url.match(/cdn\.shopify\.com/)) {
        return sizes
          .map((size) => [
            state.getShopifyImageUrl(url, `${size}x${size}`),
            size,
          ])
          .filter(([sizeUrl]) => !!sizeUrl)
          .map(([sizeUrl, size]) => `${sizeUrl} ${size}w`)
          .concat([url])
          .join(", ");
      }

      return url;
    },
    useSrcSet: function useSrcSet() {
      return props.srcset || state.getSrcSet(props.image) || "";
    },
  });

  return (
    <div
      class={css({
        position: "relative",
      })}
    >
      <picture>
        <img
          class={
            "builder-image" +
            (props.class ? " " + props.class : "") +
            " " +
            css({
              opacity: "1",
              transition: "opacity 0.2s ease-in-out",
              position: "absolute",
              height: "100%",
              width: "100%",
              top: "0px",
              left: "0px",
            })
          }
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? "presentation" : undefined}
          style={{
            "object-position": props.backgroundSize || "center",
            "object-fit": props.backgroundSize || "cover",
          }}
          src={props.image}
          srcset={props.srcset || state.getSrcSet(props.image)}
          sizes={props.sizes}
        />
        <Show when={!props.noWebp && state.useSrcSet().includes("builder.io")}>
          <source
            type="image/webp"
            srcSet={state.useSrcSet().replace(/\?/g, "?format=webp&")}
          />
        </Show>
      </picture>
      <Show
        when={
          props.aspectRatio &&
          !(props.fitContent && props.builderBlock?.children?.length)
        }
      >
        <div
          class={css({
            width: "100%",
            pointerEvents: "none",
            fontSize: "0",
          })}
          style={{
            "padding-top": props.aspectRatio * 100 + "%",
          }}
        >
          {" "}
        </div>
      </Show>
      <Show when={props.builderBlock?.children?.length && props.fitContent}>
        {props.children}
      </Show>
      <Show when={!props.fitContent}>
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
    </div>
  );
}
