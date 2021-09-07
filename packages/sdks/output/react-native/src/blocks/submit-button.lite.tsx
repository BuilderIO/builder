import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useContext } from 'react';

export default function SubmitButton(props) {
  return (
    <View {...props.attributes} type="submit">
      <Text>{props.text}</Text>
    </View>
  );
}
