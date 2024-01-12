import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { filterAttrs } from "../helpers.js";

function Textarea(props) {
  return (
    <View
      {...{}}
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    />
  );
}

export default Textarea;
