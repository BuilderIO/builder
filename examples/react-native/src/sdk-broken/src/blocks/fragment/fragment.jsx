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

function FragmentComponent(props) {
  return <View>{props.children}</View>;
}

export default FragmentComponent;
