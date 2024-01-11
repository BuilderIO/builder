import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";

function InlinedScript(props) {
  return (
    <View
      dangerouslySetInnerHTML={{ __html: props.scriptStr }}
      id={props.id || ""}
    />
  );
}

export default InlinedScript;
