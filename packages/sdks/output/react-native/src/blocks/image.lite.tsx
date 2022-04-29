import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

export default function Image(props) {
  function updateQueryParam(uri = "", key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf("?") !== -1 ? "&" : "?";

    if (uri.match(re)) {
      return uri.replace(
        re,
        "$1" + key + "=" + encodeURIComponent(value) + "$2"
      );
    }

    return uri + separator + key + "=" + encodeURIComponent(value);
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, "");
  }

  function getShopifyImageUrl(src, size) {
    if (!src || !src?.match(/cdn\.shopify\.com/) || !size) {
      return src;
    }

    if (size === "master") {
      return removeProtocol(src);
    }

    const match = src.match(
      /(_\d+x(\d+)?)?(\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?)/i
    );

    if (match) {
      const prefix = src.split(match[0]);
      const suffix = match[3];
      const useSize = size.match("x") ? size : `${size}x`;
      return removeProtocol(`${prefix[0]}_${useSize}${suffix}`);
    }

    return null;
  }

  function getSrcSet(url) {
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
        .map((size) => `${updateQueryParam(url, "width", size)} ${size}w`)
        .concat([srcUrl])
        .join(", ");
    }

    if (url.match(/cdn\.shopify\.com/)) {
      return sizes
        .map((size) => [getShopifyImageUrl(url, `${size}x${size}`), size])
        .filter(([sizeUrl]) => !!sizeUrl)
        .map(([sizeUrl, size]) => `${sizeUrl} ${size}w`)
        .concat([url])
        .join(", ");
    }

    return url;
  }

  function useSrcSet() {
    return props.srcset || getSrcSet(props.image) || "";
  }

  return (
    <View style={styles.view1}>
      <View>
        <View
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? "presentation" : undefined}
          style={styles.view2}
          src={props.image}
          srcset={props.srcset || getSrcSet(props.image)}
          sizes={props.sizes}
        />

        {!props.noWebp && useSrcSet().includes("builder.io") ? (
          <View
            type="image/webp"
            srcSet={useSrcSet().replace(/\?/g, "?format=webp&")}
          />
        ) : null}
      </View>

      {props.aspectRatio &&
      !(props.fitContent && props.builderBlock?.children?.length) ? (
        <View style={styles.view3}>
          <Text> </Text>
        </View>
      ) : null}

      {props.builderBlock?.children?.length && props.fitContent ? (
        <>
          <Text>{props.children}</Text>
        </>
      ) : null}

      {!props.fitContent ? (
        <>
          <View style={styles.view4}>
            <Text>{props.children}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  view1: { position: "relative" },
  view2: {
    opacity: 1,
    transition: "opacity 0.2s ease-in-out",
    position: "absolute",
    height: 100,
    width: 100,
    top: 0,
    left: 0,
  },
  view3: { width: 100, pointerEvents: "none", fontSize: 0 },
  view4: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
});
