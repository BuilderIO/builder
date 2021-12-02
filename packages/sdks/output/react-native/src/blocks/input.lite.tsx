import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";
import { isEditing } from "../functions/is-editing";

export default function FormInputComponent(props) {
  return (
    <View
      {...props.attributes}
      key={
        isEditing() && props.defaultValue ? props.defaultValue : "default-key"
      }
      placeholder={props.placeholder}
      type={props.type}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
    />
  );
}
