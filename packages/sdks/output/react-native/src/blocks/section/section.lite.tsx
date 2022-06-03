import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

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
