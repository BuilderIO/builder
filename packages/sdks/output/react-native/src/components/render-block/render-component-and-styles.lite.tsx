import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { TARGET } from "../../constants/target.js";
import BlockStyles from "./block-styles.lite";
import RenderBlock from "./render-block.lite";

export default function RenderComponentAndStyles(props) {
  const ComponentRefRef = props.componentRef;

  return (
    <>
      {TARGET === "vue" || TARGET === "svelte" ? (
        <>
          <BlockStyles block={props.block} />
        </>
      ) : null}

      {props.componentRef ? (
        <ComponentRefRef {...props.componentOptions}>
          {props.blockChildren?.map((child) => (
            <RenderBlock key={child.id} block={child} />
          ))}
        </ComponentRefRef>
      ) : null}
    </>
  );
}
