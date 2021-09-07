import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useContext } from 'react';

export default function FragmentComponent(props) {
  return (
    <View>
      <Text>{props.children}</Text>
    </View>
  );
}
