import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { getBlockActions } from "../../../functions/get-block-actions.js";
import { getBlockProperties } from "../../../functions/get-block-properties.js";

function InteractiveElement(props) {
  return (
    <props.Wrapper
      {...props.wrapperProps}
      attributes={{
        ...getBlockProperties({
          block: props.block,
          context: props.context,
        }),
        ...getBlockActions({
          block: props.block,
          rootState: props.context.rootState,
          rootSetState: props.context.rootSetState,
          localState: props.context.localState,
          context: props.context.context,
        }),
      }}
    >
      {props.children}
    </props.Wrapper>
  );
}

export default InteractiveElement;
