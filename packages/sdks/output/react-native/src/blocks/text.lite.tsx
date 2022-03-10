import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

export default function Text(props) {
  return <View dangerouslySetInnerHTML={{ __html: 'props.text' }} />;
}
