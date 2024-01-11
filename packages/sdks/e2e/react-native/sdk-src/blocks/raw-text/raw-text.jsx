import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";

function RawText(props) {
  return (
    <View dangerouslySetInnerHTML={{ __html: props.text?.toString() || "" }} />
  );
}

export default RawText;
