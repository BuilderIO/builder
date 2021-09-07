import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";

export default function Text(props) {
  return (
    <View
      className="builder-text"
      dangerouslySetInnerHTML={{ __html: "props.text" }}
    />
  );
}
