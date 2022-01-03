import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

export default function SubmitButton(props) {
  return (
    <View {...props.attributes} type="submit">
      <Text>{props.text}</Text>
    </View>
  );
}
