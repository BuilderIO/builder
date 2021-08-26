import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";

export default function Image(props) {
  return (
    <>
      <View>
        <View
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? "presentation" : undefined}
          className={"builder-image" + (props.class ? " " + props.class : "")}
          src={props.image}
          srcset={props.srcset}
          sizes={props.sizes}
          style={styles.view1}
        />

        <View srcSet={props.srcset} />
      </View>

      <Text>{props.children}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  view1: {
    opacity: 1,
    transition: "opacity 0.2s ease-in-out",
    objectFit: "cover",
    objectPosition: "center",
  },
});
