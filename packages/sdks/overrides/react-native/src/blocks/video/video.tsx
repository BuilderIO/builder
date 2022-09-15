// TO-DO: This file breaks due to this issue:
// https://github.com/expo/web-examples/issues/73
// For now, we do not import it elsewhere to avoid crashing Expo servers on web when importing the SDK.
import * as React from 'react';
import { View } from 'react-native';
import ReactVideo from 'react-native-video';

// Subset of Image props, many are irrelevant for native (such as altText, etc)
export interface VideoProps {
  attributes?: any;
  video?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  aspectRatio?: number;
  fit?: 'contain' | 'cover' | 'stretch';
  position?:
    | 'center'
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'top left'
    | 'top right'
    | 'bottom left'
    | 'bottom right';
  posterImage?: string;
  // TODO: support children
  children?: any;
}

// TODO: support children by wrapping in a View
export default function Video(props: VideoProps) {
  return (
    <View style={{ position: 'relative' }}>
      <ReactVideo
        paused={!props.autoPlay}
        controls={props.controls}
        muted={props.muted}
        repeat={props.loop}
        poster={props.posterImage}
        posterResizeMode={props.fit || 'contain'}
        resizeMode={props.fit || ('contain' as any)}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
        source={{ uri: props.video }}
      />
      <View
        style={{
          width: '100%',
          paddingTop: `${props.aspectRatio * 100}%`,
        }}
      />
    </View>
  );
}
