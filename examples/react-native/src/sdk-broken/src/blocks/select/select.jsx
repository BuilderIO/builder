import BaseText from "../BaseText";
("use client");
import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { isEditing } from "../../functions/is-editing.js";
import { filterAttrs } from "../helpers.js";

function SelectComponent(props) {
  return (
    <View
      {...{}}
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
          <BaseText>{option.name || option.value}</BaseText>
        </View>
      ))}
    </View>
  );
}

export default SelectComponent;
