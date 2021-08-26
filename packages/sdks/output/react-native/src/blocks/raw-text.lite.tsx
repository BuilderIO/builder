import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";

export default function RawText(props) {
  return (
    <View
      className={props.attributes?.class || props.attributes?.className}
      dangerouslySetInnerHTML={{ __html: "props.text || ''" }}
    />
  );
}
