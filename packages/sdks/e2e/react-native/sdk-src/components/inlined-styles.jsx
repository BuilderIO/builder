import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";

function InlinedStyles(props) {
  return (
    <View dangerouslySetInnerHTML={{ __html: props.styles }} id={props.id} />
  );
}

export default InlinedStyles;
