import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

export default function RawText(props) {
  return <View dangerouslySetInnerHTML={{ __html: "props.text || ''" }} />;
}
