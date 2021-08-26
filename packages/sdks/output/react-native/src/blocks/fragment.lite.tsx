import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useContext } from "react";
import RenderBlocks from "../components/render-blocks.lite";

export default function FragmentComponent(props) {
  return <RenderBlocks path="children" blocks={props.children} />;
}
