import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { isEditing } from "../../functions/is-editing.js";

export default function SelectComponent(props) {
  return (
    <View
      {...props.attributes}
      value={props.value}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : "default-key"
      }
      defaultValue={props.defaultValue}
      name={props.name}
    >
      {props.options?.map((option) => (
        <View value={option.value}>
          <Text>{option.name || option.value}</Text>
        </View>
      ))}
    </View>
  );
}
