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
import { isEditing } from "../../functions/is-editing.js";
import { filterAttrs } from "../helpers.js";

function ImgComponent(props) {
  return (
    <View
      style={{
        objectFit: props.backgroundSize || "cover",
        objectPosition: props.backgroundPosition || "center",
      }}
      key={(isEditing() && props.imgSrc) || "default-key"}
      alt={props.altText}
      src={props.imgSrc || props.image}
      {...{}}
      {...props.attributes}
    />
  );
}

export default ImgComponent;
