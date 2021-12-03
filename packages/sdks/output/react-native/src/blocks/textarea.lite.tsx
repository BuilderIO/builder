import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useContext } from 'react';

export default function Textarea(props) {
  return (
    <View
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    />
  );
}
