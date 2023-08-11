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

function Button(props) {
  return (
    <>
      {props.link ? (
        <>
          <View
            role="button"
            {...props.attributes}
            href={props.link}
            target={props.openLinkInNewTab ? "_blank" : undefined}
          >
            <BaseText>{props.text}</BaseText>
          </View>
        </>
      ) : (
        <>
          <View {...props.attributes} style={styles.view1}>
            <BaseText>{props.text}</BaseText>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({ view1: { all: "unset" } });

export default Button;
