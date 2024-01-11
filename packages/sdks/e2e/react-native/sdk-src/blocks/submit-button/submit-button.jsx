import * as React from "react";
import BaseText from "../BaseText";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { filterAttrs } from "../helpers.js";

function SubmitButton(props) {
  return (
    <View type="submit" {...{}} {...props.attributes}>
      <BaseText>{props.text}</BaseText>
    </View>
  );
}

export default SubmitButton;
