import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

export default function Text(props) {
  return (
    <View
      className="builder-text"
      dangerouslySetInnerHTML={{ __html: "props.text" }}
    />
  );
}
