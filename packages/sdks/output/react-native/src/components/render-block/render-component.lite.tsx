import * as React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import BlockStyles from "./block-styles.lite";
import RenderBlock from "./render-block.lite";

export default function RenderComponent(props) {
  const ComponentRefRef = props.componentRef;

  return (
    <>
      {props.componentRef ? (
        <>
          <ComponentRefRef {...props.componentOptions}>
            {props.blockChildren?.map((child) => (
              <RenderBlock key={"render-block-" + child.id} block={child} />
            ))}

            {props.blockChildren?.map((child) => (
              <BlockStyles key={"block-style-" + child.id} block={child} />
            ))}
          </ComponentRefRef>
        </>
      ) : null}
    </>
  );
}
