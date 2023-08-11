import BaseText from "../BaseText";
import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";

function SubmitButton(props) {
  return (
    <View type="submit" {...props.attributes}>
      <BaseText>{props.text}</BaseText>
    </View>
  );
}

export default SubmitButton;
