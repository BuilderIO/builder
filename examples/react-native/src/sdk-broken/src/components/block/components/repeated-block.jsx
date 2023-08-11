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
import { useState, useContext } from "react";
import BuilderContext from "../../../context/builder.context";
import Block from "../block";

function RepeatedBlock(props) {
  const [store, setStore] = useState(() => props.repeatContext);

  return (
    <BuilderContext.Provider value={store}>
      <Block
        block={props.block}
        context={store}
        registeredComponents={props.registeredComponents}
      />
    </BuilderContext.Provider>
  );
}

export default RepeatedBlock;
