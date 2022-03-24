import * as React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

export default function Video(props) {
  return (
    <View
      {...props.attributes}
      preload="none"
      style={{
        width: '100%',
        height: '100%',
        ...props.attributes?.style,
        objectFit: props.fit,
        objectPosition: props.position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        borderRadius: 1,
      }}
      key={props.video || 'no-src'}
      poster={props.posterImage}
      autoPlay={props.autoPlay}
      muted={props.muted}
      controls={props.controls}
      loop={props.loop}
    />
  );
}
