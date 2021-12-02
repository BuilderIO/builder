import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";

export default function Image(props) {
  return (
    <View style={styles.view1}>
      <View>
        <View
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? "presentation" : undefined}
          style={styles.view2}
          className={"builder-image" + (props.class ? " " + props.class : "")}
          src={props.image}
          srcset={props.srcset}
          sizes={props.sizes}
        />

        <View srcSet={props.srcset} />
      </View>

      {props.aspectRatio &&
      !(props.fitContent && props.builderBlock?.children?.length) ? (
        <View className="builder-image-sizer" style={styles.view3}>
          <Text> </Text>
        </View>
      ) : null}

      {props.builderBlock?.children?.length && props.fitContent ? (
        <Text>{props.children}</Text>
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
