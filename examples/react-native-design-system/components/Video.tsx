import * as React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Video as VideoAV, AVPlaybackStatus } from 'expo-av';
import { registerComponent } from '@builder.io/sdk-react-native';

export default function Video(props: {
  video: string;
  width: number;
  height: number;
  mute: boolean;
}) {
  const video = React.useRef<VideoAV>(null);
  const [status, setStatus] = React.useState({
    isPlaying: false,
  });
  React.useEffect(() => {
    if (video.current) {
      video.current.playAsync();
    }
  }, [video]);
  return (
    <VideoAV
      isMuted={props.mute}
      style={{
        width: props.width,
        height: props.height,
      }}
      ref={video}
      source={{
        uri: props.video,
      }}
      useNativeControls
      resizeMode="contain"
      isLooping
      onPlaybackStatusUpdate={status =>
        setStatus(() => ({
          isPlaying: (status as any).isPlaying,
        }))
      }
    />
  );
}

registerComponent(Video, {
  image: 'https://unpkg.com/css.gg@2.0.0/icons/svg/camera.svg',
  name: 'Video',
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
      name: 'width',
      type: 'number',
      defaultValue: 320,
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 280,
    },
    {
      name: 'mute',
      type: 'boolean',
      defaultValue: true,
    },
  ],
});
