"use client";
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

function SectionComponent(props) {
  return (
    <View
      {...{}}
      {...props.attributes}
      style={{
        width: "100%",
        alignSelf: "stretch",
        flexGrow: 1,
        boxSizing: "border-box",
        maxWidth: props.maxWidth || 1200,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {props.children}
    </View>
  );
}

export default SectionComponent;
