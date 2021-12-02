import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";

export default function SectionComponent(props) {
  return (
    <View
      {...props.attributes}
      style={
        props.maxWidth && typeof props.maxWidth === "number"
          ? {
              maxWidth: props.maxWidth,
            }
          : undefined
      }
    >
      <Text>{props.children}</Text>
    </View>
  );
}
