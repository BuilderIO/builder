import { registerComponent } from '../functions/register-component';
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

// TODO: make a way to share these configs by Mitoris being able to trace
// references for config data
registerComponent(Video, {
  name: 'Video',
  static: true,
  builtIn: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  defaultStyles: {
    position: 'relative',
    minHeight: '20px',
    minWidth: '20px',
    overflow: 'hidden',
  },
  canHaveChildren: true,
  inputs: [
    {
      name: 'video',
      type: 'file',
      allowedFileTypes: ['mp4'],
      bubble: true,
      defaultValue:
        'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2F28cb070609f546cdbe5efa20e931aa4b?alt=media&token=912e9551-7a7c-4dfb-86b6-3da1537d1a7f',
      required: true,
    },
    {
      name: 'posterImage',
      type: 'file',
      allowedFileTypes: ['jpeg', 'png'],
      helperText: 'Image to show before the video plays',
    },
    {
      name: 'autoPlay',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'controls',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'muted',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'loop',
      type: 'boolean',
      defaultValue: true,
    },

    {
      name: 'fit',
      type: 'text',
      defaultValue: 'cover',
      enum: ['contain', 'cover', 'stretch'],
    },
    {
      name: 'aspectRatio',
      type: 'number',
      advanced: true,
      defaultValue: 0.7004048582995948,
    },
  ],
});
